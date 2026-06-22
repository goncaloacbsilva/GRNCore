import type { InternalGRNModel } from '../../schema'
import { Interchanger } from '../base'
import { exportSbmlModel, importSbmlModel } from './format'

export class SBMLInterchanger extends Interchanger {
    readonly mimeType = 'application/sbml+xml'

    protected async _export(snapshot: InternalGRNModel): Promise<ArrayBuffer> {
        return new Promise((resolve) =>
            resolve(this.castToArrayBuffer(exportSbmlModel(snapshot)))
        )
    }

    async import(content: ArrayBuffer): Promise<InternalGRNModel> {
        return new Promise((resolve) =>
            resolve(importSbmlModel(this.castToString(content)))
        )
    }
}
