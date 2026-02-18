import { DotsGrid } from "@/lib/g6-extensions/dots-grid";
import { createGraphResizeController } from "@/lib/graph-resize-controller";
import { separateParallelEdges } from "@/lib/separate-parallel-edges";
import {
  ExtensionCategory,
  Graph as G6Graph,
  register,
  type GraphOptions,
  type NodeData,
} from "@antv/g6";
import { ReactNode } from "@antv/g6-extension-react";
import { useEffect, useRef } from "react";
import { RegulatoryEdge, RegulatoryNode } from "./elements";
import { P53_MODEL } from "@/data/p53-model";

export interface GraphProps {
  onRender?: (graph: G6Graph) => void;
  onDestroy?: () => void;
}

const createGraphConfig = (
  onNodeResize: (id: string, width: number, height: number) => void,
): GraphOptions => ({
  data: separateParallelEdges(P53_MODEL),
  edge: {
    type: "regulatory-edge",
    state: {
      dim: { opacity: 0.2 },
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
    {
      type: "hover-activate",
      degree: 1, // 👈🏻 Activate relations.
      inactiveState: "dim",
      onHover: (event: { view?: { setCursor: (cursor: string) => void } }) => {
        event.view?.setCursor("pointer");
      },
      onHoverEnd: (event: {
        view?: { setCursor: (cursor: string) => void };
      }) => {
        event.view?.setCursor("default");
      },
    },
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
  const isGraphReadyRef = useRef(false);
  const isUnmountedRef = useRef(false);
  const onRenderRef = useRef(onRender);
  const onDestroyRef = useRef(onDestroy);
  const isIgnorableGraphError = (error: unknown) =>
    error instanceof Error &&
    error.message.includes("this.context.element.draw");

  useEffect(() => {
    onRenderRef.current = onRender;
    onDestroyRef.current = onDestroy;
  }, [onDestroy, onRender]);

  useEffect(() => {
    isUnmountedRef.current = false;
    const graph = new G6Graph({ container: containerRef.current! });
    graphRef.current = graph;

    // Register the DotsGrid plugin
    register(ExtensionCategory.PLUGIN, "dots-grid", DotsGrid);

    // Register the ReactNode extension
    register(ExtensionCategory.NODE, "react-node", ReactNode);

    // Register custom edge
    register(ExtensionCategory.EDGE, "regulatory-edge", RegulatoryEdge);

    return () => {
      isUnmountedRef.current = true;
      isGraphReadyRef.current = false;
      const graph = graphRef.current;
      if (graph) {
        graph.destroy();
        onDestroyRef.current?.();
        graphRef.current = undefined;
      }
    };
  }, []);

  // Initialize and render the graph once the component is mounted
  useEffect(() => {
    const container = containerRef.current;
    const graph = graphRef.current;

    if (!container || !graph || graph.destroyed) return;

    const resizeController = createGraphResizeController({
      graph,
      isUnmountedRef,
      isGraphReadyRef,
      isIgnorableGraphError,
    });

    graph.setOptions(createGraphConfig(resizeController.handleNodeResize));
    graph
      .render()
      .then(() => {
        if (graph.destroyed || isUnmountedRef.current) return;
        isGraphReadyRef.current = true;
        resizeController.onGraphRendered();
        onRenderRef.current?.(graph);
      })
      .catch((error) => {
        if (
          isUnmountedRef.current ||
          graph.destroyed ||
          isIgnorableGraphError(error)
        )
          return;
        console.error(error);
      });

    return () => {
      isGraphReadyRef.current = false;
      resizeController.cleanup();
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
