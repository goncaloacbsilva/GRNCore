# Editor Performance Audit

Date: 2026-10-24

## Scope

This audit focuses on the editor behavior of the community model **Zerrouk2024 - Rheumatoid arthritis multi-cellular model**. The copied model contains 1,093 nodes and 1,807 edges.

The audit combined:

- Runtime inspection in the Vite development build.
- DOM and viewport measurements in the loaded heavy model.
- Source tracing through graph rendering, selection, dragging, validation, history, persistence, annotations, and rule editing.
- Inspection of the installed `@xyflow/react` implementation and supported large-graph rendering options.

No application source was changed as part of this audit.

## Runtime Measurements

At the initial fitted viewport, the loaded editor contained:

| Metric                          |  Count |
| ------------------------------- | -----: |
| Model nodes                     |  1,093 |
| Model edges                     |  1,807 |
| Total DOM elements              | 20,194 |
| SVG paths                       |  7,120 |
| SVG markers                     |  1,807 |
| Nodes intersecting the viewport |     17 |
| Edges intersecting the viewport |    147 |

Only about 5.7% of graph elements intersected the viewport, while all nodes and edges remained mounted. Approximately 98.4% of nodes and 91.9% of edges were offscreen but still contributed React components, subscriptions, effects, SVG definitions, and DOM nodes.

The collapsed annotations panel also retained a mounted Lexical editor (`contenteditable` remained present). Rule editors were not mounted while the new logical-expression disclosure remained closed.

## Viewport culling implementation

The editor enables React Flow's native `onlyRenderVisibleElements` renderer
option in `graph.tsx`. The controlled `nodes` and `edges` arrays remain unchanged;
React Flow filters the mounted renderer children internally during viewport
updates. This is important for pan and zoom responsiveness: an app-level policy
that rebuilt `hidden` copies of all 1,093 nodes and 1,807 edges on every viewport
update caused a measurable regression and was removed.

React Flow keeps actively dragged nodes mounted. Its edge policy uses the bounding
box of the source and target nodes, so ordinary long edges crossing the viewport
remain mounted. Custom control-point routes whose endpoints and endpoint bounding
box are both outside the viewport are a known limitation of the native policy;
preserving those routes would require a renderer-level extension rather than
per-frame controlled-array rebuilding.

## Ranked Findings

### 1. Critical: Full-graph validation runs for presentation-only changes

Evidence: `src/components/views/editor/graph/graph.tsx:107-260`.

Two effects depend directly on the full `nodes` and `edges` arrays:

- Rule validation loops over every edge and calls `nodes.find(...)` for each edge before validating every node rule.
- Edge-level validation loops over every edge and again calls `nodes.find(...)`.

For this model, each effect can perform up to roughly 1.98 million node-ID comparisons per run before expression parsing and rule conflict checks. Both effects run when array identity changes, including node positions and edge control-point positions. The selection-only ref avoids some clicks, but dragging and many unrelated graph updates still trigger the work.

Impact:

- Large main-thread stalls during node dragging and graph edits.
- Repeated validation work when no semantic data changed.
- Cascading `setNodes` or `setEdges` calls when validity changes.

### 2. Critical: Every drag frame replaces the complete edge array

Evidence:

- `src/components/views/editor/graph/utils/use-graph-interactions.ts:116-143`
- `src/components/views/editor/graph/utils/node-drag.ts:55-107`
- `src/components/views/editor/graph/edge-render-metadata-provider.tsx:16-21`
- `src/components/views/editor/graph/elements/regulatory-edge.tsx:33-142`

`onNodeDrag` calls `setEdges` on every pointer update. `shiftDraggedEdgePoints` always returns a new array after scanning all 1,807 edges, even when the dragged node has no stored edge points to move. The new array causes parallel-edge metadata to be rebuilt and changes the context value consumed by every edge. All 1,807 custom edge renderers can then recalculate routing, paths, control points, and selection effects.

The drag wrapper also calls `setDragging(true)` on every move. Because `useEditorStore` is persisted, this can pass every drag event through Zustand's persistence middleware even though only custom themes are retained.

Impact:

- Node dragging scales with total edges rather than incident edges.
- A local movement can rerender the entire edge layer.
- Additional synchronous state/persistence work occurs per pointer event.

### 3. Critical: The complete graph is mounted without viewport culling

Evidence:

- Runtime: 20,194 DOM elements, 7,120 paths, and 1,807 markers.
- Runtime: only 17 of 1,093 nodes and 147 of 1,807 edges intersected the viewport.
- `src/components/views/editor/graph/graph.tsx:303-337` does not enable `onlyRenderVisibleElements`.
- Installed React Flow exposes `onlyRenderVisibleElements` specifically for large graphs.

Impact:

- High baseline memory use.
- Expensive browser style, paint, hit-testing, and accessibility-tree maintenance.
- Zooming and panning operate over thousands of mounted SVG/HTML elements.
- Every accidental broad rerender is much more expensive.

### 4. Critical: History stores and repeatedly clones full snapshots

Evidence: `src/store/history.ts`.

Each history entry stores an `afterState` containing a cloned full model. Up to 100 entries are retained. A commit also performs several full-model operations:

- Builds and structured-clones nodes and edges.
- Sanitizes the graph multiple times.
- Clones the previous snapshot.
- Calculates forward and backward deep diffs.
- Sorts and deeply compares full node and edge arrays.
- Clones the complete `afterState` into the journal.
- Clones the canonical state while applying diffs.
- Clones the committed snapshot again for the store.

This is the strongest source-level explanation for the previously observed memory overflow. The journal calls itself diff-based, but retaining `afterState` for every entry makes its memory usage snapshot-based.

Impact:

- Large pause after drag completion and edits.
- Memory grows approximately with `model size × history entries`.
- Increased garbage collection and eventual renderer reload/crash risk.

### 5. High: Broad React Flow subscriptions fan out unrelated updates

Evidence:

- `src/hooks/use-hotkeys-setup.ts:19-22` returns a new selector object without shallow equality. Because this hook is called by `Graph`, any React Flow store notification can rerender the top-level graph, including viewport updates during zoom and pan.
- `src/components/views/editor/menu-sheet/sheet.tsx:33-42` filters all nodes and edges in a store selector.
- `src/components/views/editor/overlay/annotations/hooks/use-annotation-target.ts:16-25` repeats the same full selection scans.
- `src/components/views/editor/graph/elements/regulatory-edge.tsx:46-53` subscribes every edge to global lasso-selection state.
- `src/components/views/editor/graph/utils/use-regulatory-edge-interactions.ts:31-82` runs one lasso effect per edge and may call `setEdges` independently.

Impact:

- Zoom and pan can rerender `Graph` despite not changing graph data.
- Selection work is duplicated across the menu, annotations, hotkeys, and edges.
- Lasso movement wakes every edge component and can generate many full-array edge updates.

### 6. High: A full Lexical annotations editor remounts on selection while collapsed

Evidence:

- `src/components/views/editor/overlay/annotations/components/annotation-card.tsx:96-101` uses `forceMount`.
- `src/components/views/editor/overlay/annotations/components/annotation-content.tsx:33-50` always creates the editor and references UI.
- `src/components/views/editor/overlay/annotations/hooks/use-annotation-editing.ts:34-40` builds a selection-specific key and serializes annotation state.
- `src/components/views/editor/overlay/annotations/tiptap-editor/editor.tsx:63-140` initializes a complete Lexical extension tree and editor plugins.
- Runtime confirmed a mounted `contenteditable` while the annotation card was collapsed.

Changing selection changes `editorKey`, so the hidden editor and its plugins are torn down and recreated before the user has asked to view annotations.

Impact:

- Directly increases node and edge selection latency.
- Allocates editor state and plugin listeners for an invisible UI.
- Adds garbage collection pressure during repeated selection.

### 7. High: Autosave serializes and writes the full model for every commit

Evidence:

- `src/store/history.ts:610-628` saves after every committed snapshot.
- `src/lib/persistence/opfs-storage.ts:418-426` strips the graph and pretty-prints the complete model with `JSON.stringify(..., null, 2)` on the main thread.
- `src/lib/persistence/opfs-storage.ts:72-83` queues every write but does not debounce or coalesce superseded snapshots.

The asynchronous OPFS write does not make the synchronous graph mapping and JSON serialization asynchronous. If edits arrive faster than storage, queued closures retain older full snapshots until all writes finish.

Impact:

- Main-thread pause after edits.
- Avoidable write amplification.
- Temporary memory growth when the write queue falls behind.

### 8. Medium-High: Every edge defines a private SVG marker and multiple hit paths

Evidence:

- `src/components/views/editor/graph/elements/regulatory-edge.tsx:154-181`
- `src/components/views/editor/graph/elements/regulatory-edge-marker.tsx:52-78`
- Runtime counted exactly 1,807 `<marker>` elements and 7,120 paths.

Most edges use one of three standard interaction styles, but each edge creates its own `<defs><marker>` subtree. Each edge also creates a custom hit path and React Flow creates another interaction path for `interactionWidth={40}`.

Impact:

- Thousands of redundant SVG elements.
- More expensive SVG style/paint/hit-testing.
- A 40-pixel interaction width creates extensive overlap in dense, zoomed-out graphs and makes precise node selection harder.

### 9. Medium: Expanding logical rules creates one Monaco editor and form per rule

Evidence:

- `src/components/views/editor/menu-sheet/menus/base-properties/node/node-rules.tsx`
- `src/components/views/editor/menu-sheet/menus/base-properties/node/node-rule.tsx`
- `src/components/forms/field-components/rule-editor-field.tsx`

The disclosure now protects ordinary node selection, but expanding it maps every rule to a TanStack form and a separate Monaco model/editor. Each rule has several effects that can independently trigger field validation and graph updates.

Impact:

- Large latency and memory spike when opening rules for rule-heavy nodes.
- Duplicate parsing and validation while editing.
- Multiple Monaco automatic-layout observers in a narrow scrolling panel.

## Recommended Order

1. Fix full-graph validation and the drag edge-array update path together.
2. Enable/test viewport culling and remove top-level broad subscriptions.
3. Lazy-mount the annotations editor to restore fast selection.
4. Redesign history before further heavy-model editing to remove the crash risk.
5. Coalesce autosave and deduplicate SVG markers.
6. Rework the logical-rule editor for on-demand single-rule editing.

## Agent Prompts

Each prompt below is standalone and can be assigned independently, although prompts 1 and 2 should be coordinated because they touch the same interaction path.

### Prompt 1: Make validation incremental and semantic

```text
You are working in the grn-core React/TypeScript repository. Fix the editor's full-graph validation hot path for large models.

Context:
- The heavy regression model has 1,093 nodes and 1,807 edges.
- In src/components/views/editor/graph/graph.tsx, the effects around lines 107-260 depend on the complete nodes and edges arrays.
- Rule validation loops through every edge and performs nodes.find(...) for each edge.
- Edge-level validation maps every edge and performs another nodes.find(...).
- These effects run for position, selection, drag, and control-point changes even when semantic rule/activity-level data did not change.

Implement an incremental validation architecture:
- Build O(1) node-by-id and incoming-adjacency indexes rather than calling nodes.find inside edge loops.
- Separate semantic model changes from presentation changes. Node positions, selection, dragging, dimensions, z-index, and edge routing points must not trigger rule or level validation.
- Validate only affected nodes/edges when a node name, activity level, rule, edge endpoint, or edge level changes.
- Do not call setNodes/setEdges when validity is unchanged.
- Keep validation behavior and error indicators identical.
- Prefer extracting pure validation/indexing helpers that can be unit tested.

Add tests using a synthetic graph with at least 1,000 nodes and 1,500 edges. Prove that a position-only or selection-only change invokes no semantic validation, and that changing one node's activity level validates only that node's incident edges and dependent rules. Run lint, build, and tests. Report measured before/after validation counts or timings.
```

### Prompt 2: Make node dragging proportional to incident edges

```text
You are working in the grn-core React/TypeScript repository. Remove whole-graph edge work from node dragging.

Context:
- src/components/views/editor/graph/utils/use-graph-interactions.ts calls setEdges on every onNodeDrag event.
- src/components/views/editor/graph/utils/node-drag.ts scans all edges and always returns a new array, even when no stored control points change.
- src/components/views/editor/graph/edge-render-metadata-provider.tsx rebuilds metadata whenever the edge array changes.
- Every RegulatoryEdge consumes that context, so replacing the array can rerender all 1,807 edges.
- use-graph-drag-handlers.ts also calls setDragging(true) on every move through a persisted Zustand store.

Refactor dragging so cost is proportional to the dragged nodes and their incident edges:
- Build or reuse an adjacency map from node ID to incident edge IDs.
- Do not replace the edge array during drag when an edge has no stored point that needs movement.
- Update only affected edges while preserving object identity for all unaffected edges.
- Prefer keeping temporary drag geometry outside persisted model state and commit final edge control-point changes once on drag stop.
- Ensure parallel-edge metadata is not recomputed for position-only drag frames unless its grouping inputs actually changed.
- Set the dragging flag only on start and stop, not on every move. Ensure transient drag state bypasses persisted Zustand writes.
- Preserve multi-node dragging, self-loops, custom anchors, undo as one step, and saved final positions.

Add focused unit tests for shiftDraggedEdgePoints and an interaction/performance test on a 1,000-node/1,500-edge graph. Assert that dragging one node does not replace unrelated edges and does not create one history or persistence write per frame. Run lint, build, and tests, then report before/after frame or callback costs.
```

### Prompt 3: Add viewport culling for the large graph

```text
You are working in the grn-core React/TypeScript repository. Reduce the editor's mounted graph size with viewport culling.

Measured baseline for the rheumatoid-arthritis model:
- 1,093 nodes and 1,807 edges are mounted.
- The page has about 20,194 DOM elements, 7,120 SVG paths, and 1,807 markers.
- At the fitted viewport only 17 nodes and 147 edges intersect the viewport.

React Flow supports the onlyRenderVisibleElements prop, currently omitted in src/components/views/editor/graph/graph.tsx.

Implement and validate viewport culling:
- Start by testing onlyRenderVisibleElements on ReactFlow.
- Verify panning, wheel zoom, animated zoom controls, selection, lasso selection, dragging, edge routing, self-loops, node toolbars, and fitView.
- Verify whether React Flow omits long edges whose endpoints are offscreen but whose path crosses the viewport. If so, implement an overscanned/custom visibility policy that preserves crossing edges.
- Keep selected or actively dragged elements mounted even when near/outside the viewport.
- Add a development performance fixture or automated test for a 1,000+ node graph.

Acceptance criteria:
- At the initial heavy-model viewport, mounted nodes/edges should be close to the visible set plus a documented overscan, not all 2,900 elements.
- No blanking or popping during normal pan/zoom.
- Interaction behavior remains correct.
- Capture before/after DOM counts and pan/zoom responsiveness. Run lint, build, and tests.
```

### Prompt 4: Replace snapshot-heavy history with bounded patches

```text
You are working in the grn-core React/TypeScript repository. Redesign src/store/history.ts to prevent large-model memory growth and post-edit freezes.

Current problems:
- Every HistoryEntry stores forwardDiffs, backwardDiffs, and a full cloned afterState.
- Up to 100 full model snapshots are retained.
- A commit repeatedly structured-clones, sanitizes, sorts, deep-compares, and diffs the whole graph in both directions.
- getSnapshotAtPosition clones full snapshots again.
- This behavior is a likely cause of the observed memory overflow/page reload on the 1,093-node/1,807-edge model.

Implement a genuinely patch-based history:
- Keep one baseline/canonical state and store only forward/inverse patches per transaction.
- Generate patches from the graph operation when practical instead of deep-diffing the complete model after every update.
- Reconstruct undo/redo by applying patches; do not retain a full afterState per entry.
- Bound history by estimated bytes as well as entry count so one large operation cannot exhaust memory.
- Keep selection, dimensions, dragging, z-index, and other transient React Flow fields out of history.
- Preserve grouped operations, baseline semantics, undo/redo toasts, title/annotation behavior, and persistence integration.

Add tests for 100 edits on a synthetic 1,000-node/1,500-edge model. Record retained history bytes or a defensible approximation and verify it grows with changed fields, not full model size times entry count. Test undo/redo equivalence, grouped edits, branch truncation after undo, and baseline limits. Run lint, build, and tests.
```

### Prompt 5: Narrow React Flow subscriptions and centralize selection

```text
You are working in the grn-core React/TypeScript repository. Remove broad React Flow subscriptions that cause unrelated editor rerenders.

Audit targets:
- src/hooks/use-hotkeys-setup.ts returns {selectedNodesCount, selectedEdgesCount} from useStore without shallow equality. The hook is called inside Graph, so React Flow store notifications can rerender the top-level graph during pan/zoom.
- MenuSheet and useAnnotationTarget each filter the full node and edge arrays in separate selectors.
- Every RegulatoryEdge subscribes to global userSelectionRect/userSelectionActive and runs its own lasso-selection effect.

Refactor:
- Use primitive selectors, useShallow where appropriate, or useStoreApi for values only needed inside event callbacks.
- Keep Graph independent of viewport/store updates that do not change controlled nodes or edges.
- Introduce a single selected-elements selector/source, ideally using React Flow's selection listener or selected-ID sets, and share it between menus, annotations, hotkeys, and toolbar code.
- Move lasso edge hit-testing to one centralized pass per rectangle update. Produce one batched edge change instead of one effect and possible setEdges call per edge.
- Preserve multi-selection semantics and edge-control-point selection.

Add render-count instrumentation/tests proving that pan and zoom do not rerender Graph, MenuSheet, annotations, or every edge. Verify one node click performs one selection update and lasso performs at most one batched edge update per frame. Run lint, build, and tests.
```

### Prompt 6: Lazy-mount annotations and stop remounting Lexical on selection

```text
You are working in the grn-core React/TypeScript repository. Fix selection latency caused by the annotations UI.

Context:
- AnnotationCard uses CollapsibleContent forceMount.
- AnnotationContent always mounts a full Lexical Editor and ReferencesEditor, even when annotations are collapsed.
- useAnnotationEditing builds a selection-specific editorKey and JSON.stringify value, so every node/edge selection tears down and recreates the hidden Lexical editor and all plugins.
- Runtime inspection confirmed a contenteditable remains mounted while the panel is collapsed.

Implement lazy annotation UI:
- When collapsed, render only the annotation header and a cheap indicator/count. Do not mount Lexical, editor plugins, references forms, or contenteditable.
- Mount the editor only when the user expands annotations; defer heavy initialization until after the expand interaction paints if necessary.
- Avoid JSON.stringify as a render identity mechanism. Reset editor state explicitly when the annotation target changes.
- Preserve unsaved-edit behavior: define and test what happens if selection changes while editing (save, cancel, or block with existing product conventions).
- Avoid remounting the editor when the same target receives unrelated graph updates.

Add tests that ordinary node/edge selection leaves zero annotation contenteditables/editors mounted while collapsed, and that expansion loads the correct annotation. Profile selection on the heavy model before and after. Run lint, build, and tests.
```

### Prompt 7: Coalesce autosave and move serialization off the interaction path

```text
You are working in the grn-core React/TypeScript repository. Redesign local-model autosave so large graph interactions do not synchronously serialize and queue every intermediate snapshot.

Context:
- takeSnapshot in src/store/history.ts calls saveLocalModelSnapshot after every commit.
- writeSnapshotFile in src/lib/persistence/opfs-storage.ts maps the full graph and pretty-prints it with JSON.stringify(..., null, 2) on the main thread.
- enqueuePersistenceWrite serializes every queued snapshot in order and does not discard superseded saves.

Implement latest-state autosave:
- Debounce graph saves after committed edits and flush on route exit/page lifecycle where safe.
- Coalesce pending saves per model: if a newer snapshot arrives before an older queued save starts, keep only the newest one.
- Do not retain an unbounded list of full snapshots in queued closures.
- Move graph sanitization/serialization to a Web Worker when supported, or otherwise schedule it outside pointer/keyboard interaction frames.
- Remove pretty-print whitespace for persisted snapshots unless required for compatibility.
- Preserve atomicity and ensure an older asynchronous write can never overwrite a newer snapshot.
- Keep the saving indicator accurate for debounced and in-flight work.

Add deterministic tests for rapid consecutive saves, write ordering, route flush, failure recovery, and latest-state correctness. Benchmark 50 rapid edits on a 1,000-node/1,500-edge model and report serialization time, number of physical writes, and peak queued snapshots. Run lint, build, and tests.
```

### Prompt 8: Deduplicate edge SVG markers and simplify hit areas

```text
You are working in the grn-core React/TypeScript repository. Reduce redundant SVG DOM in the custom RegulatoryEdge renderer.

Measured baseline for 1,807 edges:
- 1,807 SVG marker elements.
- 7,120 SVG paths.

Current code creates one RegulatoryEdgeMarker <defs><marker> per edge and also creates both a custom transparent hit path and React Flow's interaction path with interactionWidth=40.

Refactor:
- Render shared marker definitions once per distinct marker style/color combination at graph level.
- Have edges reference stable shared marker IDs. Support custom stroke colors without returning to one marker per edge; cache combinations or use context-stroke if browser support is acceptable and tested.
- Remove duplicate hit paths. Keep a single interaction path with a zoom-aware, bounded width.
- Reduce the current 40-pixel interaction width at low zoom or otherwise prevent edge hit areas from covering nearby nodes in dense models.
- Preserve activation, inhibition, dual markers, custom colors, selection, and anchor/control-point editing.

Add visual/interaction tests for all marker styles and dense node/edge overlap. Report before/after marker, path, and total DOM counts on the heavy model. Run lint, build, and tests.
```

### Prompt 9: Use one on-demand rule editor instead of one Monaco instance per rule

```text
You are working in the grn-core React/TypeScript repository. Optimize logical-rule editing for nodes with many rules.

Context:
- The rule section is now collapsed by default, which protects basic selection.
- When expanded, NodeRules maps every rule to NodeRule.
- Each NodeRule creates a TanStack form and RuleEditorField creates a separate Monaco model/editor with automaticLayout.
- NodeRule contains several overlapping validation effects that parse expressions and can update graph state.

Implement scalable rule editing:
- Render a lightweight rule list/summary first.
- Mount one Monaco editor only for the currently selected/expanded rule, or virtualize the list and dispose editors/models as rows leave the viewport.
- Consolidate validation into one debounced pipeline per active rule and avoid duplicate validateField/validateAllFields/expression-parse effects.
- Cache parsed expressions where safe and validate against stable incoming-node/edge indexes.
- Commit one graph update per logical edit transaction, preserving focus, errors, suggestions, target conflicts, undo, and autosave.
- Ensure Monaco models, listeners, and layout observers are disposed on rule switch/unmount.

Add tests for nodes with many rules and verify that opening the section mounts at most one Monaco editor. Measure open latency and heap/DOM growth before and after. Run lint, build, and tests.
```

## Cross-Cutting Acceptance Scenario

After each fix, test the same copied rheumatoid-arthritis model and record:

- Time from node pointer-down to selected styling.
- Time from selection to properties header display.
- Drag frame pacing for a node with several incident edges.
- Pan and wheel-zoom frame pacing.
- Mounted node, edge, marker, path, and total DOM counts.
- JavaScript heap after load and after 50 select/drag cycles.
- History memory after 100 edits.
- Number and duration of physical persistence writes.

Use a production build for final numbers; React development mode adds overhead and is useful mainly for finding rerender patterns.
