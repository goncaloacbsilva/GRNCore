export const GINML_DOCTYPE =
    '<!DOCTYPE gxl SYSTEM "http://ginsim.org/GINML_2_2.dtd">'

export const GINML_NAMESPACES = {
    xlink: 'http://www.w3.org/1999/xlink',
    grn: 'https://grn-core.dev/ns/ginml/v1',
} as const

export const GINML_ANNOTATIONS_TAG = 'grn:annotations'
export const GINML_PAYLOAD_TAG = 'grn:payload'

export const GINML_DEFAULTS = {
    nodeWidth: 120,
    nodeHeight: 45,
    edgeAnchor: 'NE',
    selfLoopAnchor: 'NW',
} as const
