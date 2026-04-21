import type { InternalGRNModel } from '@/lib/schema'

export const P53_NODES_ONLY_MODEL: InternalGRNModel = {
    nodes: [
        {
            id: 'node-1',
            position: { x: 70, y: 100 },
            data: {
                name: 'p53',
                activityLevels: 2,
                isInputNode: false,
                rules: [],
            },
        },
        {
            id: 'node-2',
            position: { x: 250, y: 100 },
            data: {
                name: 'DNAdam',
                activityLevels: 1,
                isInputNode: false,
                rules: [],
            },
        },
        {
            id: 'node-3',
            position: { x: 50, y: 200 },
            data: {
                name: 'Mdm2cyt',
                activityLevels: 2,
                isInputNode: false,
                rules: [],
            },
        },
        {
            id: 'node-4',
            position: { x: 245, y: 200 },
            data: {
                name: 'Mdm2nuc',
                activityLevels: 1,
                isInputNode: false,
                rules: [],
            },
        },
    ],
    edges: [],
}
