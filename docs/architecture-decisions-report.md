# GRN Core Architecture Decisions Report

**Scope.** This report was reconstructed from the current `main` codebase at `cf99255` (18 August 2026) and the complete locally available Git history: 405 commits across `main`, feature branches, remote-tracking branches, and the performance-test WIP commits. Commit messages are useful evidence of intent, but the current implementation is the source of truth. Decisions marked **superseded** describe an important architectural transition rather than a current dependency.

## Executive Summary

GRN Core is a browser-first, static React application for editing gene regulatory networks. Its architecture centres on a stable internal graph model and keeps external formats, browser persistence, UI state, and graph-canvas state at explicit boundaries. The major evolutionary pattern is replacing generic infrastructure with domain-specific implementations where generic behaviour exposed editor correctness or performance problems.

The clearest examples are the migration from G6 to React Flow, from generic Zustand time travel to a custom graph-history journal, and from a general bioLQM conversion layer to format-specific import/export implementations.

## Current Architecture

```text
Routes and layouts (TanStack Router)
    |
    +-- Models: local metadata and community catalogues
    |       |
    |       +-- OPFS persistence / remote catalogue cache
    |
    +-- Editor route
            |
            +-- React Flow canvas and custom regulatory elements
            +-- Zustand UI state
            +-- Domain-aware history journal
            +-- InternalGRNModel (canonical model boundary)
                    |
                    +-- Zod schemas and regulatory-rule validation
                    +-- BNET / SBML-qual / GINML / ZGINML interchangers
```

## Decisions

### 1. Deliver a static, browser-first application

**Decision.** GRN Core is built with React and Vite, deployed as static files to GitHub Pages. It has no application server or database in the current architecture.

**Evidence.** The initial GitHub Pages deployment was added in `e54c426` and the base-path correction followed in `674f687`. The current deployment workflow builds `dist` and deploys it with GitHub Pages; `vite.config.ts` derives the base path from `import.meta.env.BASE_URL`.

**Why it matters.** This keeps the tool platform-independent and cheap to operate, but shifts durable-data responsibility to the browser and export files. The local-model UI explicitly communicates that browser storage may be cleared, so exports are the portable backup mechanism.

**Current code.** `.github/workflows/deploy.yml`, `vite.config.ts`, and `src/routes/models/local.tsx`.

### 2. Use React Flow as the graph interaction engine

**Decision.** The graph editor uses `@xyflow/react` (React Flow) rather than AntV G6.

**Evolution.** The initial editor used G6 with custom extensions (`18ce4e1` and `318a505`). Commit `25012fe`, _Move from antv/g6 to React Flow (#13)_, removed G6 and introduced React Flow's controlled node/edge state and custom node/edge registrations.

**Rationale inferred from the migration.** React Flow provides a React-native controlled canvas, hooks, provider, selection, connection, viewport, and node/edge state APIs. This better fits the surrounding React components and enables custom regulatory interactions without owning the full graph lifecycle.

**Trade-off.** GRN Core still owns its domain-specific geometry: parallel-edge separation, self-loop layout, editable control points, endpoint handles, and regulatory node/edge rendering. React Flow is the interaction substrate, not the biological graph model.

**Current code.** `src/components/views/editor/graph/graph.tsx`, `src/components/views/editor/view.tsx`, and `src/components/views/editor/graph/elements/`.

### 3. Maintain a canonical internal model independent of file formats

**Decision.** All editor, persistence, history, and interchange workflows converge on `InternalGRNModel`: title, optional annotations, typed regulatory nodes, and typed regulatory edges.

**Evidence.** The model is defined in `src/lib/schema/internal-model.ts` and is used by `history.ts`, OPFS storage, routes, and every interchanger. The schema work began before the graph-engine migration (`c1268b3` and `3f90fcf`) and became the format boundary during the import/export work.

**Why it matters.** The application can import several formats, normalize them once, edit one representation, persist that representation, and export to a chosen format. The canvas library and any particular external standard do not become the application data model.

**Trade-off.** Some external-standard semantics cannot map perfectly. Format modules must make explicit conversion choices rather than passing opaque source objects through the editor.

**Current code.** `src/lib/schema/internal-model.ts`, `src/store/history.ts`, and `src/lib/interchange/`.

### 4. Put validation and normalization at the domain boundary

**Decision.** Regulatory node, edge, annotation, metadata, and catalogue data are modeled with Zod schemas. Input can be normalized to a safe editable value rather than rejected wholesale.

**Evidence.** `RegulatoryNodePropertiesSchema` provides defaults and `normalizeRegulatoryNodeProperties` preserves an invalid raw name so it remains editable. Routes parse loader inputs, and persistence validates metadata and catalogues before they are used. This approach originated with the early schema commits and was reinforced by `69b8e01`, `d9a0004`, and the route-loader validation in `05ff2e2`.

**Why it matters.** Imported or partially edited models can be represented in the UI without allowing malformed values to silently propagate as valid domain data. It also gives importers and forms a shared contract.

**Current code.** `src/lib/schema/`, `src/routes/edit.$modelId.tsx`, and `src/routes/models/local.tsx`.

### 5. Treat regulatory rules as a language, not free-form strings

**Decision.** Rule expressions are parsed with an Ohm grammar and evaluated through semantic operations; graph-aware validation then checks the expression against incoming nodes, interaction signs, and activity thresholds.

**Evidence.** The two regulatory-rule feature phases, `8352b42` and `a436f21`, introduced the grammar, semantics, editor integration, and contextual validation. The current validation builds edge constraints before accepting a rule reference.

**Why it matters.** Syntax highlighting alone cannot establish whether a rule is meaningful in the graph. This design catches both malformed expressions and invalid biological references while keeping the expression text editable.

**Trade-off.** The grammar and semantic conversion logic are maintained in the client and must evolve with supported interchange semantics.

**Current code.** `src/lib/regulatory-rules/` and the validity reconciliation in `src/components/views/editor/graph/graph.tsx`.

### 6. Separate canvas state, UI state, and durable model state

**Decision.** React Flow owns immediate canvas node/edge state; Zustand stores cross-component editor UI state and small application-state stores; the history store owns the loaded model snapshot and persistence boundary.

**Evidence.** `useNodesState` and `useEdgesState` are local to `Graph`, while `useEditorStore` contains dialogs, modes, selection IDs, clipboard, theme preferences, and transient guards. Its persisted subset is stored in `localStorage`. `useChangesTracking` loads/saves the actual model snapshot. This split started with the state-management milestone `5f561fa` and evolved as history and persistence were introduced.

**Why it matters.** The graph canvas remains responsive and library-native; UI preferences survive refreshes without making them part of the biological model; saved models are not coupled to every editor interaction.

**Trade-off.** State ownership must be respected carefully. History application uses explicit flags such as `isApplyingHistory` and `isSnapshotPaused` to avoid recording programmatic canvas updates as user edits.

**Current code.** `src/store/editor.ts`, `src/store/history.ts`, and `src/components/views/editor/graph/graph.tsx`.

### 7. Replace generic time travel with a domain-aware history journal

**Decision.** Undo/redo is implemented as a bounded custom journal of forward and backward `microdiff` patches over canonical graph snapshots.

**Evolution.** The first implementation used `zustand-travel`/Travels (`3e92826`, `888559b`, and `b660d77`). It was patched to stop tracking selection state (`bd4b7c8` and `eacb7c2`) and bounded to 100 entries (`6a28ce5`). Commit `9a05ef3`, _History (#31)_, replaced the generic middleware with the current journal.

**Rationale.** A graph editor generates framework-level mutations that are not meaningful user edits: selection, dragging, measurements, dimensions, z-indexes, accessibility fields, and validity recalculation. The journal canonicalizes snapshots, filters that noise, discards the redo tail after a new edit, stores inverse patches for undo, groups multi-step operations, and keeps at most 100 entries.

**Important boundary.** Model title and model annotations are deliberately outside graph history. The current comment in `sanitizeSnapshot` makes this explicit. That is a product decision, not an omission.

**Current code.** `src/store/history.ts`, `src/lib/history-utils.ts`, and `src/hooks/use-history.ts`.

**Residual cleanup.** `travels` and `zustand-travel` remain in `package.json`, but no active source import uses them. They are historical dependency residue and can be removed after confirming no planned restoration or external tooling depends on them.

### 8. Persist local models and catalogues in the Origin Private File System

**Decision.** Durable browser data uses OPFS through `opfs-tools`, with a separate metadata index and snapshot files. A small Zustand status store exposes saving state to the UI.

**Evidence.** OPFS integration began in `af0680d` and was expanded in `3d794bb` (_Persistence (#32)_). `opfs-storage.ts` detects browser support, serializes writes through a promise queue, stores snapshots under `/snapshots`, and stores the list metadata in `/metadata.json`.

**Why it matters.** OPFS suits large structured local data better than using `localStorage` for models, while metadata can be listed without reading every snapshot. The serialized write queue prevents concurrent metadata/snapshot operations from racing.

**Trade-off.** The storage is browser-origin scoped and can be evicted; there is no cross-device synchronization. The application provides import/export and warns users accordingly.

**Current code.** `src/lib/persistence/opfs-storage.ts`, `src/store/persistence.ts`, and `src/routes/models/local.tsx`.

### 9. Use an interchanger port with format-specific adapters

**Decision.** Import/export is exposed through an `Interchanger` abstraction and registry, with dedicated BNET, SBML-qual, GINML, and ZGINML implementations. All adapters exchange `ArrayBuffer` content and return the canonical internal model.

**Evolution.** BNET support arrived in `09ed2a1`; SBML support initially used a bioLQM conversion layer in `31c6dde`; GINML/ZGINML followed in `b0201ad`. Commit `8693880`, _Interchange formats (#36)_, removed the generic bioLQM adapter and reorganized the format implementations into focused modules with fixtures and round-trip tests.

**Rationale.** Each standard has materially different XML, MathML, logical rule, annotation, layout, and archive semantics. Direct adapters make those rules visible, independently testable, and less vulnerable to the memory and conversion issues addressed around `398d079` and `cf68a67`.

**Trade-off.** More domain code is owned locally, but behaviour is explicit and format-specific tests protect it.

**Current code.** `src/lib/interchange/base.ts`, `src/lib/interchange/interchanger.ts`, and `src/lib/interchange/{bnet,sbml,ginml,zginml}`.

### 10. Preserve rich annotations through a shared persisted representation

**Decision.** Model, node, and edge annotations use a persisted schema that can carry editor content and references, and format adapters handle annotation embedding/extraction where the target format permits it.

**Evidence.** Annotations were introduced in `adacd8b`; their persisted schema was propagated through the model and SBML layer in `4ef4cdd`, `b697c21`, and `9fccd23`. GINML has its own annotation conversion module, mirroring the format-specific adapter decision.

**Why it matters.** Documentation is first-class model data rather than a purely visual panel. Keeping a common representation allows persistence and interchange to preserve it as far as external formats allow.

**Trade-off.** The annotation editor's serialized rich-text state is an application format. Export adapters must deliberately degrade or encode it for formats that do not share that representation.

**Current code.** `src/lib/schema/annotations.ts`, `src/components/views/editor/overlay/annotations/`, `src/lib/interchange/sbml/annotations.ts`, and `src/lib/interchange/ginml/annotations.ts`.

### 11. Model management is route-driven and metadata-first

**Decision.** Local models are identified by route parameter, loaded at the route boundary, and listed/filtered from metadata rather than by eagerly loading every full graph snapshot.

**Evidence.** The Local Models milestone (`969166e`) introduced routes, metadata, and an OPFS-backed list. The editor route loads the selected snapshot and redirects to the local list when it does not exist. The route-loader update in `05ff2e2` validates loader data and avoids route preloads mutating editor state.

**Why it matters.** Navigation owns model selection and failure handling; listing remains inexpensive as the number or size of saved models grows; editor state does not leak from speculative preloads.

**Current code.** `src/routes/edit.$modelId.tsx`, `src/routes/models/`, `src/lib/schema/model-metadata.ts`, and `src/lib/persistence/opfs-storage.ts`.

### 12. Cache community catalogues locally and refresh by version

**Decision.** Community model catalogues are cached in OPFS, displayed from cache when available, and refreshed through a version check with a 15-minute freshness window. Remote models are copied into the local-model space before editing.

**Evidence.** Community models were introduced in `a1b8813`; catalogue persistence appears in `809770c`; `cf99255` added version metadata and freshness handling. The community route renders cached entries first, attempts a refresh, and retains cached data when a refresh fails.

**Why it matters.** Browsing does not depend on every network request succeeding, while catalogue changes can still become visible promptly. Copying a community model locally establishes clear ownership: the imported model can be edited and persisted without mutating the remote source.

**Trade-off.** Cached catalogue metadata may be stale for up to the refresh policy and source-specific downloading still has to handle different APIs.

**Current code.** `src/lib/persistence/community-catalogs.ts` and `src/routes/models/community.tsx`.

### 13. Use file-based, typed routing with loader validation

**Decision.** The application uses TanStack Router file routes and a generated typed route tree. Root and parent routes own redirect/layout behaviour; loaders perform data acquisition and validate their inputs.

**Evidence.** Routing became part of the local-model architecture in `969166e`. The current routes redirect `/models` to `/models/local`, provide parent layouts and route metadata, and validate the edit-route loader context using Zod. Generated `src/routeTree.gen.ts` is intentionally ignored from source control (`c562eb4`).

**Why it matters.** URLs are stable entry points for models, layout ownership is explicit, and data loading has a natural failure boundary before the editor renders.

**Current code.** `src/routes/__root.tsx`, `src/routes/models/`, `src/routes/edit.$modelId.tsx`, and `src/main.tsx`.

### 14. Keep performance testing separate until its integration contract is ready

**Decision status.** **In progress, not part of `main` architecture.** The available WIP commit `94e00e8` adds Playwright, graph bridges, model generation, a performance report script, and performance specifications. It is not an ancestor of the current `main` tip.

**Why it matters.** This indicates an intended black-box performance harness that can drive the browser and exercise generated graph sizes, rather than a production runtime subsystem. It should be treated as proposed architecture until the work is committed onto `main`, scripts are exposed in `package.json`, and CI policy is defined.

## Cross-Cutting Architectural Principles

The decisions above repeatedly express four principles:

1. **Canonicalize at boundaries.** External files, browser storage, and history all map to a controlled internal model rather than exposing framework objects or source-format data throughout the application.
2. **Prefer domain semantics over generic state mechanics.** Rules are parsed, history ignores canvas noise, and interchange is format-specific where the biology requires it.
3. **Keep browser constraints visible.** The static deployment and OPFS choice avoid a backend, but the UI, caching policy, and export workflows acknowledge storage and network limits.
4. **Make expensive work incremental.** Metadata is separate from snapshots, catalogues are cached and refreshed conditionally, and history stores diffs rather than complete undo snapshots.

## Superseded or Stale Components

| Component                        | Status                  | Replacement / action                                                                             |
| -------------------------------- | ----------------------- | ------------------------------------------------------------------------------------------------ |
| AntV G6                          | Superseded in `25012fe` | React Flow with custom regulatory elements                                                       |
| `zustand-travel` / Travels       | Superseded in `9a05ef3` | Custom `microdiff` domain-aware journal; remove unused packages after dependency review          |
| Generic bioLQM interchange layer | Superseded in `8693880` | Dedicated BNET, SBML, GINML, and ZGINML implementations                                          |
| Performance-test WIP             | Not integrated          | Decide scripts, CI thresholds, and merge strategy before treating it as established architecture |

## Verification Notes

This report is a code-and-history analysis, not a claim that every historical commit represents a final decision. In particular, the status of dependencies and the performance-test WIP was verified against the current checked-out source rather than inferred solely from commit messages.
