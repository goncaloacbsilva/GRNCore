const SIMPLE_IDENTIFIER_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/

export function isSimpleRuleIdentifier(value: string): boolean {
    return SIMPLE_IDENTIFIER_PATTERN.test(value)
}

export function formatRuleIdentifier(value: string): string {
    if (isSimpleRuleIdentifier(value)) {
        return value
    }

    return `"${value.replaceAll('\\', '\\\\').replaceAll('"', '\\"')}"`
}

export function parseRuleIdentifierToken(token: string): string {
    if (
        token.length >= 2 &&
        token.startsWith('"') &&
        token.endsWith('"')
    ) {
        return token
            .slice(1, -1)
            .replace(/\\(.)/g, '$1')
    }

    return token
}
