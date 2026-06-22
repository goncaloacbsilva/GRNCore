import type { InternalGRNModel } from '@/lib/schema'
import { Interchanger } from '../base'
import { exportGinmlModel, importGinmlModel } from './format'

export class GINMLInterchanger extends Interchanger {
    mimeType = 'application/gxl'

    protected _export(snapshot: InternalGRNModel): Promise<ArrayBuffer> {
        return Promise.resolve(
            this.castToArrayBuffer(exportGinmlModel(snapshot))
        )
    }

    import(content: ArrayBuffer): Promise<InternalGRNModel> {
        return Promise.resolve(importGinmlModel(this.castToString(content)))
    }
}
