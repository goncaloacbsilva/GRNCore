import type { InternalGRNModel } from '@/lib/schema'
import { Interchanger } from '../base'
import { exportBNetModel, importBNetModel } from './format'

export class BooleanNetworkInterchanger extends Interchanger {
    readonly mimeType = 'text/plain'

    protected _export(snapshot: InternalGRNModel): Promise<ArrayBuffer> {
        return Promise.resolve(
            this.castToArrayBuffer(exportBNetModel(snapshot))
        )
    }

    import(content: ArrayBuffer): Promise<InternalGRNModel> {
        return Promise.resolve(importBNetModel(this.castToString(content)))
    }
}
