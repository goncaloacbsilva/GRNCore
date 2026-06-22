import type { InternalGRNModel } from '@/lib/schema'
import { assignNodePositions } from './placement'
import { parseBNetModel } from './parser'

const BNET_HEADER = 'targets, factors'

export function importBNetModel(content: string): InternalGRNModel {
    const parsedModel = parseBNetModel(content)

    return {
        title: 'bnet-model',
        ...parsedModel,
        nodes: assignNodePositions(parsedModel.nodes),
    }
}

export function exportBNetModel(model: InternalGRNModel): string {
    validateBooleanModel(model)

    const lines = model.nodes.map((node) => {
        const expression =
            node.data.rules.find((rule) => rule.expression.trim().length > 0)
                ?.expression ?? ''

        return `${node.data.name}, ${expression.trim()}`
    })

    return [BNET_HEADER, ...lines].join('\n')
}

function validateBooleanModel(model: InternalGRNModel): void {
    for (const node of model.nodes) {
        if (node.data.activityLevels !== 1) {
            throw new Error(`BoolNet doesn't support multi-level models.`)
        }

        const nonEmptyRules = node.data.rules.filter(
            (rule) => rule.expression.trim().length > 0
        )

        if (nonEmptyRules.some((rule) => rule.target !== 1)) {
            throw new Error(`BoolNet only supports rules targeting level 1.`)
        }
    }
}
