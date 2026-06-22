export const SBML_NAMESPACES = {
    sbml: 'http://www.sbml.org/sbml/level3/version1/core',
    qual: 'http://www.sbml.org/sbml/level3/version1/qual/version1',
    layout: 'http://www.sbml.org/sbml/level3/version1/layout/version1',
    mathml: 'http://www.w3.org/1998/Math/MathML',
    xhtml: 'http://www.w3.org/1999/xhtml',
    rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
    bqbiol: 'http://biomodels.net/biology-qualifiers/',
    grn: 'https://grn-core.dev/ns/sbml/v1',
} as const

export const SBML_LAYOUT = {
    nodeWidth: 120,
    nodeHeight: 45,
} as const

export const DEFAULT_NODE_POSITION = {
    x: 0,
    y: 0,
} as const

export const GRN_ANNOTATIONS_TAG = 'grn:annotations'
export const GRN_PAYLOAD_TAG = 'grn:payload'
