import type { Graph as G6Graph } from "@antv/g6";
import type { RefObject } from "react";

/**
 * Controller to manage resizing of graph nodes and revealing edges after initial render.
 *
 * This is necessary because G6 does not handle dynamic node size changes well during the
 * initial render, which can lead to incorrect edge routing.
 * By deferring edge visibility until after node sizes are measured and updated,
 * we can ensure correct layout and routing of edges.
 *
 * Important: This controller was vibe-coded since the logic is quite complex and tightly
 * coupled to G6's rendering lifecycle. Please be cautious when making changes and ensure
 * to test thoroughly with various graph configurations.
 */

interface GraphResizeControllerOptions {
  graph: G6Graph;
  isUnmountedRef: RefObject<boolean>;
  isGraphReadyRef: RefObject<boolean>;
  isIgnorableGraphError: (error: unknown) => boolean;
}

export interface GraphResizeController {
  handleNodeResize: (id: string, width: number, height: number) => void;
  onGraphRendered: () => void;
  cleanup: () => void;
}

export const createGraphResizeController = (
  options: GraphResizeControllerOptions,
): GraphResizeController => {
  const { graph, isUnmountedRef, isGraphReadyRef, isIgnorableGraphError } =
    options;

  let flushRafId: number | null = null;
  let revealTimeoutId: number | null = null;

  const sizeCache = new Map<string, [number, number]>();
  const pendingSize = new Map<string, [number, number]>();
  const measuredNodeIds = new Set<string>();
  let expectedNodeCount = 0;
  let edgeIds: string[] = [];
  let hasRevealedEdges = false;

  const safelyHandleError = (error: unknown) => {
    if (
      isUnmountedRef.current ||
      graph.destroyed ||
      isIgnorableGraphError(error)
    ) {
      return;
    }

    console.error(error);
  };

  const maybeRevealEdges = (force = false) => {
    if (
      !isGraphReadyRef.current ||
      hasRevealedEdges ||
      (!force &&
        (expectedNodeCount === 0 || measuredNodeIds.size < expectedNodeCount))
    ) {
      return;
    }

    if (edgeIds.length === 0) {
      hasRevealedEdges = true;
      return;
    }

    hasRevealedEdges = true;

    if (revealTimeoutId !== null) {
      clearTimeout(revealTimeoutId);
      revealTimeoutId = null;
    }

    void graph
      .setElementState(
        Object.fromEntries(edgeIds.map((id) => [id, "visible"] as const)),
        true,
      )
      .catch(safelyHandleError);
  };

  const flushPendingSizes = () => {
    if (
      pendingSize.size === 0 ||
      graph.destroyed ||
      isUnmountedRef.current ||
      !isGraphReadyRef.current
    ) {
      return;
    }

    const updates = Array.from(pendingSize.entries()).map(
      ([id, [width, height]]) => ({
        id,
        style: { size: [width, height] as [number, number] },
      }),
    );

    pendingSize.clear();
    graph.updateNodeData(updates);
    graph.draw().catch(safelyHandleError);
    maybeRevealEdges();
  };

  const scheduleFlushPendingSizes = () => {
    if (flushRafId !== null) return;

    flushRafId = requestAnimationFrame(() => {
      flushRafId = null;
      flushPendingSizes();
    });
  };

  const handleNodeResize = (id: string, width: number, height: number) => {
    if (!width || !height || graph.destroyed) return;

    const previousSize = sizeCache.get(id);
    if (previousSize?.[0] === width && previousSize?.[1] === height) {
      return;
    }

    sizeCache.set(id, [width, height]);
    measuredNodeIds.add(id);
    pendingSize.set(id, [width, height]);
    if (isGraphReadyRef.current) {
      scheduleFlushPendingSizes();
    }
  };

  const onGraphRendered = () => {
    expectedNodeCount = graph.getNodeData().length;
    edgeIds = graph.getEdgeData().map((edge) => String(edge.id));

    flushPendingSizes();
    maybeRevealEdges();

    if (revealTimeoutId !== null) {
      clearTimeout(revealTimeoutId);
    }

    revealTimeoutId = window.setTimeout(() => {
      maybeRevealEdges(true);
      revealTimeoutId = null;
    }, 20);
  };

  const cleanup = () => {
    if (flushRafId !== null) {
      cancelAnimationFrame(flushRafId);
      flushRafId = null;
    }

    if (revealTimeoutId !== null) {
      clearTimeout(revealTimeoutId);
      revealTimeoutId = null;
    }

    pendingSize.clear();
    measuredNodeIds.clear();
    expectedNodeCount = 0;
    edgeIds = [];
    hasRevealedEdges = false;
  };

  return {
    handleNodeResize,
    onGraphRendered,
    cleanup,
  };
};
