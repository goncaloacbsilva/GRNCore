import type { InternalGRNModel } from '@/lib/schema'

export abstract class Interchanger {
    abstract readonly mimeType: string

    export(snapshot: InternalGRNModel): Promise<string> {
        validateModel(snapshot)
        return this._export(snapshot)
    }

    protected abstract _export(snapshot: InternalGRNModel): Promise<string>
    abstract import(content: string): Promise<InternalGRNModel>
}

function validateModel(model: InternalGRNModel): void {
    for (const node of model.nodes) {
        const nonEmptyRules = node.data.rules.filter(
            (rule) => rule.expression.trim().length > 0
        )

        for (const rule of nonEmptyRules) {
            if (!rule.isValid) {
                throw new Error(`Model contains invalid rules.`)
            }
        }
    }
}
