export function compactRuleExpression(expression: string) {
    const compact = expression.replace(/\s+/g, ' ').trim()

    return compact || 'Empty expression'
}
