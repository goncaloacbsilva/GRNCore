import type { InternalGRNModel } from '../schema'
import { Interchanger } from './base'
import {
    createInternalModelFromLogicalModel,
    createLogicalModelFromInternalModel,
} from './bio-lqm-utils'
import { SBMLFormat } from 'biolqm-io-ts'
import { StringStreamProvider } from './bio-lqm-utils/string-stream-provider'

export class SBMLInterchanger extends Interchanger {
    readonly mimeType = 'application/sbml+xml'
    private readonly sbmlFormat = new SBMLFormat()

    protected async _export(snapshot: InternalGRNModel): Promise<ArrayBuffer> {
        const outputStreamProvider = new StringStreamProvider()
        const model = createLogicalModelFromInternalModel(snapshot)
        await this.sbmlFormat.exportToProvider(model, outputStreamProvider)

        return this.castToArrayBuffer(outputStreamProvider.getString())
    }

    async import(content: ArrayBuffer): Promise<InternalGRNModel> {
        const inputStreamProvider = new StringStreamProvider()
        inputStreamProvider.setString(this.castToString(content))
        const model =
            await this.sbmlFormat.loadFromProvider(inputStreamProvider)

        return createInternalModelFromLogicalModel(model)
    }
}
