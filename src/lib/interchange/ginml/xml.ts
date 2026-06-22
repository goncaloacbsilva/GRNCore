import { XMLBuilder, XMLParser, XMLValidator } from 'fast-xml-parser'

type XmlRecord = Record<string, unknown>

const ARRAY_PATHS = new Set([
    'gxl.graph.node',
    'gxl.graph.edge',
    'gxl.graph.node.value',
    'gxl.graph.node.value.exp',
    'gxl.graph.node.annotation.linklist.link',
    'gxl.graph.edge.annotation.linklist.link',
    'gxl.graph.annotation.linklist.link',
    'gxl.graph.nodestyle',
    'gxl.graph.edgestyle',
])

const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    parseTagValue: false,
    trimValues: false,
    isArray: (_name, jpath) =>
        typeof jpath === 'string' && ARRAY_PATHS.has(jpath),
})

const builder = new XMLBuilder({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    format: true,
    suppressEmptyNode: true,
    suppressBooleanAttributes: false,
    textNodeName: '#text',
})

export function parseXml(xml: string): XmlRecord {
    const validationResult = XMLValidator.validate(xml)

    if (validationResult !== true) {
        throw new Error(
            `Invalid GINML XML: ${validationResult.err.msg} at line ${validationResult.err.line}`
        )
    }

    return parser.parse(xml) as XmlRecord
}

export function ensureArray<T>(value: T | T[] | undefined | null): T[] {
    if (value === undefined || value === null) {
        return []
    }

    return Array.isArray(value) ? value : [value]
}

export function asRecord(value: unknown): XmlRecord | undefined {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
        return value as XmlRecord
    }

    return undefined
}

export function getAttribute(
    value: XmlRecord | undefined,
    name: string
): string | undefined {
    const attributeValue = value?.[`@_${name}`]

    return typeof attributeValue === 'string' ? attributeValue : undefined
}

export function getNumberAttribute(
    value: XmlRecord | undefined,
    name: string
): number | undefined {
    const rawValue = getAttribute(value, name)

    if (rawValue === undefined) {
        return undefined
    }

    const parsedValue = Number(rawValue)

    return Number.isFinite(parsedValue) ? parsedValue : undefined
}

export function getBooleanAttribute(
    value: XmlRecord | undefined,
    name: string
): boolean | undefined {
    const rawValue = getAttribute(value, name)

    if (rawValue === undefined) {
        return undefined
    }

    return rawValue === 'true'
}

export function getNodeText(value: unknown): string {
    if (typeof value === 'string') {
        return value
    }

    if (Array.isArray(value)) {
        return value.map((item) => getNodeText(item)).join('')
    }

    const record = asRecord(value)

    if (!record) {
        return ''
    }

    return Object.entries(record)
        .filter(([key]) => !key.startsWith('@_'))
        .map(([key, childValue]) => {
            if (key === '#text') {
                return typeof childValue === 'string' ? childValue : ''
            }

            return getNodeText(childValue)
        })
        .join('')
}

export function compactText(value: string): string {
    return value.replace(/\r\n/g, '\n').replace(/\s+\n/g, '\n').trim()
}

export function buildXml(document: XmlRecord): string {
    return builder.build(document)
}

export type { XmlRecord }
