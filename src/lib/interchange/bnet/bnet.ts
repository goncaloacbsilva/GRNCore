import type { InternalGRNModel } from '@/lib/schema'
import { Interchanger } from '../base'
import { exportBNetModel, importBNetModel } from './format'

export class BooleanNetworkInterchanger extends Interchanger {
    readonly mimeType = 'text/plain'

    protected async _export(snapshot: InternalGRNModel): Promise<ArrayBuffer> {
        return this.castToArrayBuffer(exportBNetModel(snapshot))
    }

    async import(content: ArrayBuffer): Promise<InternalGRNModel> {
        return importBNetModel(this.castToString(content))
    }
}
