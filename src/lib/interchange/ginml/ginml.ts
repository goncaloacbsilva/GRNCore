import type { InternalGRNModel } from '@/lib/schema'
import { Interchanger } from '../base'
import { exportGinmlModel, importGinmlModel } from './format'

export class GINMLInterchanger extends Interchanger {
    readonly mimeType = 'application/gxl'

    protected async _export(snapshot: InternalGRNModel): Promise<ArrayBuffer> {
        return this.castToArrayBuffer(exportGinmlModel(snapshot))
    }

    async import(content: ArrayBuffer): Promise<InternalGRNModel> {
        return importGinmlModel(this.castToString(content))
    }
}
