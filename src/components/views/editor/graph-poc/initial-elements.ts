import type { Node } from '@xyflow/react'
import { EDGE_ALGORITHM, type EditableEdge } from './types'

export const initialNodes: Node[] = [
    { id: '1', type: 'custom', data: {}, position: { x: 0, y: 0 } },
    { id: '2', type: 'custom', data: {}, position: { x: 250, y: 0 } },
    { id: '3', type: 'custom', data: {}, position: { x: 0, y: 175 } },
    { id: '4', type: 'custom', data: {}, position: { x: 250, y: 100 } },
    { id: '5', type: 'custom', data: {}, position: { x: 0, y: 350 } },
    { id: '6', type: 'custom', data: {}, position: { x: 250, y: 250 } },
    { id: '7', type: 'custom', data: {}, position: { x: 0, y: 550 } },
    { id: '8', type: 'custom', data: {}, position: { x: 250, y: 450 } },
]

export const initialEdges: EditableEdge[] = [
    {
        id: '1->2',
        type: 'editable-edge',
        source: '1',
        target: '2',
        sourceHandle: 'right',
        targetHandle: 'left',
        animated: true,
        data: {
            algorithm: EDGE_ALGORITHM.CatmullRom,
            points: [
                { x: 92.5, y: 24.75, id: 'p-1', active: true },
                { x: 129.5, y: 16.25, id: 'p-2', active: true },
                { x: 168, y: -19.25, id: 'p-3', active: true },
                { x: 143, y: -45, id: 'p-4', active: true },
                { x: 119.5, y: -20.75, id: 'p-5', active: true },
                { x: 159.5, y: 17.25, id: 'p-6', active: true },
                { x: 202.5, y: 23.25, id: 'p-7', active: true },
            ],
        },
    },
    {
        id: '3->4',
        type: 'editable-edge',
        source: '3',
        target: '4',
        sourceHandle: 'right',
        targetHandle: 'left',
        data: {
            algorithm: EDGE_ALGORITHM.BezierCatmullRom,
            points: [],
        },
    },
    {
        id: '5->6',
        type: 'editable-edge',
        source: '5',
        target: '6',
        sourceHandle: 'right',
        targetHandle: 'left',
        animated: true,
        data: {
            algorithm: EDGE_ALGORITHM.Step,
            points: [],
        },
    },
    {
        id: '7->8',
        type: 'editable-edge',
        source: '7',
        target: '8',
        sourceHandle: 'right',
        targetHandle: 'left',
        animated: false,
        data: {
            algorithm: EDGE_ALGORITHM.Linear,
            points: [
                { x: 100, y: 575, id: 'p-8', active: true },
                { x: 100, y: 525, id: 'p-9', active: true },
                { x: 150, y: 525, id: 'p-10', active: true },
                { x: 150, y: 625, id: 'p-11', active: true },
                { x: 200, y: 625, id: 'p-12', active: true },
                { x: 200, y: 475, id: 'p-13', active: true },
            ],
        },
    },
]
