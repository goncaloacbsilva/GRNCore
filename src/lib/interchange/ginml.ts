import type { InternalGRNModel } from '../schema'
import { Interchanger } from './base'
import {
    createInternalModelFromLogicalModel,
    createLogicalModelFromInternalModel,
} from './bio-lqm-utils'
import { GINMLFormat } from 'biolqm-io-ts'
import { StringStreamProvider } from './bio-lqm-utils/string-stream-provider'

export class GINMLInterchanger extends Interchanger {
    mimeType = 'application/gxl'
    private readonly ginmlFormat = new GINMLFormat()

    protected async _export(snapshot: InternalGRNModel): Promise<ArrayBuffer> {
        const outputStreamProvider = new StringStreamProvider()
        const model = createLogicalModelFromInternalModel(snapshot)
        await this.ginmlFormat.exportToProvider(model, outputStreamProvider)

        return this.castToArrayBuffer(outputStreamProvider.getString())
    }

    async import(content: ArrayBuffer): Promise<InternalGRNModel> {
        const inputStreamProvider = new StringStreamProvider()
        inputStreamProvider.setString(this.castToString(content))
        const model =
            await this.ginmlFormat.loadFromProvider(inputStreamProvider)

        return createInternalModelFromLogicalModel(model)
    }
}
