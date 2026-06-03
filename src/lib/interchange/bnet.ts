import type { InternalGRNModel } from '@/lib/schema'
import { Interchanger } from './base'

const bnetHeader = (modelName: string) => [
    `# ${modelName}`,
    '# Exported from GRN Core',
    '# the header targets, factors is mandatory to be importable in the R package BoolNet',
    '',
    'targets, factors',
]

const normalizeExpression = (expression: string) =>
    expression.trim().replaceAll('&&', '&').replaceAll('||', '|')

const wrapExpression = (expression: string) =>
    expression.includes('&') || expression.includes('|')
        ? `(${expression})`
        : expression

export class BooleanNetworkInterchanger extends Interchanger {
    readonly mimeType = 'text/plain'

    _export(snapshot: InternalGRNModel): Promise<string> {
        const lines = [...bnetHeader(snapshot.title)]

        for (const node of snapshot.nodes) {
            const { name, activityLevels, isInputNode, rules } = node.data

            if (activityLevels !== 1) {
                return Promise.reject(
                    new Error(`BoolNet doesn't support multi-level models.`)
                )
            }

            const nonEmptyRules = rules.filter(
                (rule) => rule.expression.trim().length > 0
            )

            if (nonEmptyRules.some((rule) => rule.target !== 1)) {
                return Promise.reject(
                    new Error(`BoolNet doesn't support multi-level models.`)
                )
            }

            let factor = '0'

            if (nonEmptyRules.length > 0) {
                factor = nonEmptyRules
                    .map((rule) =>
                        wrapExpression(normalizeExpression(rule.expression))
                    )
                    .join(' | ')
            } else if (isInputNode) {
                factor = name
            }

            lines.push(`${name}, ${factor}`)
        }

        return Promise.resolve(lines.join('\n'))
    }

    import(content: string): Promise<InternalGRNModel> {
        console.log(content)

        return Promise.reject(
            new Error('Importing from BoolNet format is not supported yet.')
        )
    }
}
