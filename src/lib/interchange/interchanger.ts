import type { InternalGRNModel } from '@/lib/schema'
import { Interchanger } from './base'
import { BooleanNetworkInterchanger } from './bnet'

export const InterchangeFormat = {
    BNET: 'bnet',
} as const

export type InterchangeFormat =
    (typeof InterchangeFormat)[keyof typeof InterchangeFormat]

const REGISTERED_INTERCHANGERS: Record<InterchangeFormat, Interchanger> = {
    [InterchangeFormat.BNET]: new BooleanNetworkInterchanger(),
}

export function getInterchangeFormat(filename: string): InterchangeFormat {
    const extension = filename.split('.').pop()?.toLowerCase()

    if (!extension) {
        throw new Error('Unable to determine import format from file name.')
    }

    const format = Object.values(InterchangeFormat).find(
        (value) => value === extension
    )

    if (!format) {
        throw new Error(`Unsupported import format: .${extension}`)
    }

    return format
}

export async function exportModel(
    snapshot: InternalGRNModel,
    format: InterchangeFormat
) {
    const interchanger = REGISTERED_INTERCHANGERS[format]

    const content = await interchanger.export(snapshot)
    const filename = `${snapshot.title}.${format}`
    download(content, filename, interchanger.mimeType)
}

export async function importModel(file: File) {
    const format = getInterchangeFormat(file.name)
    const content = await file.text()

    const interchanger = REGISTERED_INTERCHANGERS[format]
    return await interchanger.import(content)
}

// Some utils
function download(content: string, filename: string, mimeType: string) {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()

    URL.revokeObjectURL(url)
}
