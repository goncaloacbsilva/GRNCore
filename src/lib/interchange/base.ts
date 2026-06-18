import type { InternalGRNModel } from '@/lib/schema'

export abstract class Interchanger {
    abstract readonly mimeType: string

    export(snapshot: InternalGRNModel): Promise<ArrayBuffer> {
        validateModel(snapshot)
        return this._export(snapshot)
    }

    protected castToString(data: ArrayBuffer): string {
        return new TextDecoder().decode(data)
    }

    protected castToArrayBuffer(data: string): ArrayBuffer {
        return new TextEncoder().encode(data).buffer
    }

    protected abstract _export(snapshot: InternalGRNModel): Promise<ArrayBuffer>
    abstract import(content: ArrayBuffer): Promise<InternalGRNModel>
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
