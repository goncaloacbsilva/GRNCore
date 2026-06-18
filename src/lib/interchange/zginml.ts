import type { InternalGRNModel } from '../schema'
import { unzipSync, zipSync } from 'fflate'
import { GINMLInterchanger } from './ginml'

export class ZGINMLInterchanger extends GINMLInterchanger {
    constructor() {
        super()
        this.mimeType = 'application/zip'
    }

    async import(content: ArrayBuffer): Promise<InternalGRNModel> {
        const archive = unzipSync(new Uint8Array(content))
        const ginmlEntry = Object.entries(archive).find(([filename]) =>
            filename.toLowerCase().endsWith('.ginml')
        )

        if (!ginmlEntry) {
            throw new Error('ZIP archive does not contain a .ginml file.')
        }

        const [, ginmlContent] = ginmlEntry

        return super.import(
            ginmlContent.buffer.slice(
                ginmlContent.byteOffset,
                ginmlContent.byteOffset + ginmlContent.byteLength
            )
        )
    }

    protected override async _export(
        snapshot: InternalGRNModel
    ): Promise<ArrayBuffer> {
        const ginmlContent = new Uint8Array(await super._export(snapshot))
        const folder = 'GINsim-data'
        const filename = `${folder}/regulatoryGraph.ginml`
        const archive = zipSync({
            [filename]: ginmlContent,
            [`${folder}/initialState`]: new Uint8Array(
                this.castToArrayBuffer(
                    '<?xml version="1.0" encoding="UTF-8"?>\n<initialStates/>'
                )
            ),
        })

        return archive.buffer.slice(
            archive.byteOffset,
            archive.byteOffset + archive.byteLength
        )
    }
}
