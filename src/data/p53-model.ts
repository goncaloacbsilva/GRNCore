import type { GraphData } from "@antv/g6";

export const P53_MODEL: GraphData = {
  nodes: [
    {
      id: "node-1",
      style: { x: 70, y: 100 },
      data: {
        name: "p53",
      },
    },
    {
      id: "node-2",
      style: { x: 250, y: 100 },
      data: {
        name: "DNAdam",
      },
    },
    {
      id: "node-3",
      style: { x: 50, y: 200 },
      data: {
        name: "Mdm2cyt",
      },
    },
    {
      id: "node-4",
      style: { x: 245, y: 200 },
      data: {
        name: "Mdm2nuc",
      },
    },
  ],
  edges: [
    {
      id: "edge-1",
      source: "node-1",
      target: "node-2",
      states: ["hidden"],
      data: {
        type: "inhibition",
      },
    },
    {
      id: "edge-2",
      source: "node-1",
      target: "node-3",
      states: ["hidden"],
      data: {
        type: "activation",
      },
    },
    {
      id: "edge-3",
      source: "node-1",
      target: "node-4",
      states: ["hidden"],
      data: {
        type: "inhibition",
      },
    },
    {
      id: "edge-4",
      source: "node-3",
      target: "node-4",
      states: ["hidden"],
      data: {
        type: "activation",
      },
    },
    {
      id: "edge-5",
      source: "node-2",
      target: "node-4",
      states: ["hidden"],
      data: {
        type: "inhibition",
      },
    },
    {
      id: "edge-6",
      source: "node-4",
      target: "node-1",
      states: ["hidden"],
      data: {
        type: "inhibition",
      },
    },
  ],
};
