import type { InternalGRNModel } from '@/lib/schema'

export const P53_MODEL: InternalGRNModel = {
    nodes: [
        {
            id: 'node-1',
            position: { x: 70, y: 100 },
            data: {
                name: 'p53',
                activityLevels: 2,
                isInputNode: false,
            },
        },
        {
            id: 'node-2',
            position: { x: 250, y: 100 },
            data: {
                name: 'DNAdam',
                activityLevels: 1,
                isInputNode: false,
            },
        },
        {
            id: 'node-3',
            position: { x: 50, y: 200 },
            data: {
                name: 'Mdm2cyt',
                activityLevels: 2,
                isInputNode: false,
            },
        },
        {
            id: 'node-4',
            position: { x: 245, y: 200 },
            data: {
                name: 'Mdm2nuc',
                activityLevels: 1,
                isInputNode: false,
            },
        },
    ],
    edges: [
        {
            id: 'edge-1',
            source: 'node-1',
            target: 'node-2',
            data: {
                type: 'inhibition',
                target: 1,
            },
        },

        {
            id: 'edge-2',
            source: 'node-1',
            target: 'node-3',
            data: {
                type: 'activation',
                target: 1,
            },
        },
        {
            id: 'edge-3',
            source: 'node-1',
            target: 'node-4',
            data: {
                type: 'inhibition',
                target: 1,
            },
        },
        {
            id: 'edge-4',
            source: 'node-3',
            target: 'node-4',
            data: {
                type: 'activation',
                target: 1,
            },
        },
        {
            id: 'edge-5',
            source: 'node-2',
            target: 'node-4',
            data: {
                type: 'inhibition',
                target: 1,
            },
        },
        {
            id: 'edge-6',
            source: 'node-4',
            target: 'node-1',
            data: {
                type: 'inhibition',
                target: 1,
            },
        },
        /*
        {
            id: 'edge-7',
            source: 'node-2',
            target: 'node-2',
            data: {
                type: 'activation',
                target: 1,
            },
        }, */
    ],
}
