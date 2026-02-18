import { DotsGrid } from "@/lib/g6-extensions/dots-grid";
import {
  ExtensionCategory,
  Graph as G6Graph,
  register,
  type GraphOptions,
  type NodeData,
} from "@antv/g6";
import { ReactNode } from "@antv/g6-extension-react";
import { useEffect, useRef } from "react";
import { RegulatoryNode } from "./elements";

export interface GraphProps {
  onRender?: (graph: G6Graph) => void;
  onDestroy?: () => void;
}

const createGraphConfig = (
  onNodeResize: (id: string, width: number, height: number) => void,
): GraphOptions => ({
  data: {
    nodes: [
      {
        id: "node-1",
        style: { x: 50, y: 100, size: [20, 20] },
        data: {
          name: "p53",
        },
      },
      {
        id: "node-2",
        style: { x: 150, y: 100, size: [20, 20] },
        data: {
          name: "Mdm2cyt",
        },
      },
    ],
    edges: [
      {
        id: "edge-1",
        source: "node-1",
        target: "node-2",
        states: ["hidden"],
      },
    ],
  },
  edge: {
    state: {
      hidden: { opacity: 0 },
      visible: { opacity: 1 },
    },
    animation: {
      state: [{ fields: ["opacity"], shape: "key" }],
    },
  },
  node: {
    type: "react-node",
    style: {
      component: (data: NodeData) => (
        <RegulatoryNode
          data={data}
          onResize={(width, height) =>
            onNodeResize(String(data.id), width, height)
          }
        />
      ),
    },
  },
  zoomRange: [0.8, 2.5],
  behaviors: [
    "drag-canvas",
    {
      key: "custom-zoom-canvas",
      type: "zoom-canvas",
      enable: (event: { ctrlKey?: boolean; scale?: number }) => {
        // Allow both trackpad Ctrl+wheel and native pinch events.
        return !!event.ctrlKey || typeof event.scale === "number";
      },
    },
    "drag-element",
    "scroll-canvas",
  ],
  plugins: [
    {
      key: "dots-grid",
      type: "dots-grid",
      size: 20,
      dotColor: "#ebebeb",
      dotRadius: 1.5,
      follow: true,
    },
  ],
});

export const Graph = (props: GraphProps) => {
  const { onRender, onDestroy } = props;
  const graphRef = useRef<G6Graph>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const sizeCacheRef = useRef<Map<string, string>>(new Map());
  const pendingSizeRef = useRef<Map<string, [number, number]>>(new Map());
  const measuredNodeIdsRef = useRef<Set<string>>(new Set());
  const expectedNodeIdsRef = useRef<Set<string>>(new Set());
  const hasRevealedEdgesRef = useRef(false);
  const revealTimeoutRef = useRef<number | null>(null);
  const isGraphReadyRef = useRef(false);
  const isUnmountedRef = useRef(false);
  const isIgnorableGraphError = (error: unknown) =>
    error instanceof Error &&
    error.message.includes("this.context.element.draw");

  useEffect(() => {
    isUnmountedRef.current = false;
    const graph = new G6Graph({ container: containerRef.current! });
    graphRef.current = graph;

    // Register the DotsGrid plugin
    register(ExtensionCategory.PLUGIN, "dots-grid", DotsGrid);

    // Register the ReactNode extension
    register(ExtensionCategory.NODE, "react-node", ReactNode);

    return () => {
      isUnmountedRef.current = true;
      isGraphReadyRef.current = false;
      const graph = graphRef.current;
      if (graph) {
        graph.destroy();
        onDestroy?.();
        graphRef.current = undefined;
      }
    };
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    const graph = graphRef.current;

    if (!container || !graph || graph.destroyed) return;

    const scheduleDraw = () => {
      if (rafRef.current !== null) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        if (
          graph.destroyed ||
          isUnmountedRef.current ||
          !isGraphReadyRef.current
        )
          return;
        graph.draw().catch((error) => {
          if (
            isUnmountedRef.current ||
            graph.destroyed ||
            isIgnorableGraphError(error)
          )
            return;
          // eslint-disable-next-line no-console
          console.error(error);
        });
      });
    };

    const maybeRevealEdges = (force = false) => {
      if (
        !isGraphReadyRef.current ||
        hasRevealedEdgesRef.current ||
        (!force &&
          (expectedNodeIdsRef.current.size === 0 ||
            measuredNodeIdsRef.current.size < expectedNodeIdsRef.current.size))
      ) {
        return;
      }

      const edges = graph.getEdgeData();
      if (edges.length === 0) {
        hasRevealedEdgesRef.current = true;
        return;
      }

      hasRevealedEdgesRef.current = true;
      if (revealTimeoutRef.current !== null) {
        clearTimeout(revealTimeoutRef.current);
        revealTimeoutRef.current = null;
      }
      void graph
        .setElementState(
          Object.fromEntries(
            edges.map((edge) => [String(edge.id), "visible"] as const),
          ),
          true,
        )
        .catch((error) => {
          if (
            isUnmountedRef.current ||
            graph.destroyed ||
            isIgnorableGraphError(error)
          )
            return;
          // eslint-disable-next-line no-console
          console.error(error);
        });
    };

    const flushPendingSizes = () => {
      if (
        pendingSizeRef.current.size === 0 ||
        graph.destroyed ||
        isUnmountedRef.current ||
        !isGraphReadyRef.current
      ) {
        return;
      }

      const updates = Array.from(pendingSizeRef.current.entries()).map(
        ([id, [width, height]]) => ({
          id,
          style: { size: [width, height] as [number, number] },
        }),
      );
      pendingSizeRef.current.clear();

      graph.updateNodeData(updates);
      scheduleDraw();
      maybeRevealEdges();
    };

    const handleNodeResize = (id: string, width: number, height: number) => {
      if (!width || !height || graph.destroyed) return;

      const sizeKey = `${width}x${height}`;
      if (sizeCacheRef.current.get(id) === sizeKey) return;
      sizeCacheRef.current.set(id, sizeKey);
      measuredNodeIdsRef.current.add(id);

      pendingSizeRef.current.set(id, [width, height]);
      flushPendingSizes();
    };

    graph.setOptions(createGraphConfig(handleNodeResize));
    graph
      .render()
      .then(() => {
        if (graph.destroyed || isUnmountedRef.current) return;
        isGraphReadyRef.current = true;
        expectedNodeIdsRef.current = new Set(
          graph.getNodeData().map((node) => String(node.id)),
        );
        flushPendingSizes();
        maybeRevealEdges();
        if (revealTimeoutRef.current !== null) {
          clearTimeout(revealTimeoutRef.current);
        }
        revealTimeoutRef.current = window.setTimeout(() => {
          maybeRevealEdges(true);
          revealTimeoutRef.current = null;
        }, 20);
        onRender?.(graph);
      })
      .catch((error) => {
        if (
          isUnmountedRef.current ||
          graph.destroyed ||
          isIgnorableGraphError(error)
        )
          return;
        // eslint-disable-next-line no-console
        console.error(error);
      });

    return () => {
      isGraphReadyRef.current = false;
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      if (revealTimeoutRef.current !== null) {
        clearTimeout(revealTimeoutRef.current);
        revealTimeoutRef.current = null;
      }
      pendingSizeRef.current.clear();
      measuredNodeIdsRef.current.clear();
      expectedNodeIdsRef.current.clear();
      hasRevealedEdgesRef.current = false;
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100%",
        userSelect: "none",
        WebkitUserSelect: "none",
        WebkitTapHighlightColor: "transparent",
      }}
    />
  );
};
