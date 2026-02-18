import { DotsGrid } from "@/lib/g6-extensions/dots-grid";
import {
  ExtensionCategory,
  Graph as G6Graph,
  register,
  type GraphOptions,
} from "@antv/g6";
import { useEffect, useRef } from "react";

export interface GraphProps {
  onRender?: (graph: G6Graph) => void;
  onDestroy?: () => void;
}

const GRAPH_CONFIG: GraphOptions = {
  data: {
    nodes: [
      {
        id: "node-1",
        style: { x: 50, y: 100 },
      },
      {
        id: "node-2",
        style: { x: 150, y: 100 },
      },
    ],
    edges: [{ id: "edge-1", source: "node-1", target: "node-2" }],
  },
  zoomRange: [0.8, 2.5],
  behaviors: ["drag-canvas", "zoom-canvas", "drag-element"],
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
};

export const Graph = (props: GraphProps) => {
  const { onRender, onDestroy } = props;
  const graphRef = useRef<G6Graph>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const graph = new G6Graph({ container: containerRef.current! });
    graphRef.current = graph;

    // Register the DotsGrid plugin
    register(ExtensionCategory.PLUGIN, "dots-grid", DotsGrid);

    return () => {
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

    graph.setOptions(GRAPH_CONFIG);
    graph
      .render()
      .then(() => onRender?.(graph))
      // eslint-disable-next-line no-console
      .catch((error) => console.debug(error));
  }, []);

  return <div ref={containerRef} style={{ width: "100%", height: "100%" }} />;
};
