import type * as monaco from 'monaco-editor'

export const RULE_LANGUAGE_ID = 'regulatory-rule'
export const RULE_THEME_ID = 'regulatory-rule-theme'
const VARIABLE_NAME_PATTERN =
    String.raw`[A-Za-z_][A-Za-z0-9_]*(?:\s+[A-Za-z0-9_]+)*`
const SETUP_STATE_KEY = Symbol.for('grn-core.regulatory-rule-language-setup')

interface RegulatoryRuleSuggestionContext {
    variables: string[]
    variableActivityLevels: Record<string, number>
}

interface RegulatoryRuleLanguageSetupState {
    isRegistered: boolean
}

const setupState =
    ((globalThis as Record<symbol, RegulatoryRuleLanguageSetupState | undefined>)[
        SETUP_STATE_KEY
    ] ??= { isRegistered: false })
const suggestionsByModelUri = new Map<string, RegulatoryRuleSuggestionContext>()

export function setRegulatoryRuleSuggestions(
    modelUri: string,
    suggestions: RegulatoryRuleSuggestionContext
) {
    suggestionsByModelUri.set(modelUri, suggestions)
}

export function clearRegulatoryRuleSuggestions(modelUri: string) {
    suggestionsByModelUri.delete(modelUri)
}

export function ensureRegulatoryRuleEditorSetup(monacoInstance: typeof monaco) {
    if (setupState.isRegistered) {
        return
    }

    monacoInstance.languages.register({ id: RULE_LANGUAGE_ID })

    monacoInstance.languages.setLanguageConfiguration(RULE_LANGUAGE_ID, {
        brackets: [['(', ')']],
        autoClosingPairs: [{ open: '(', close: ')' }],
        surroundingPairs: [{ open: '(', close: ')' }],
    })

    monacoInstance.languages.setMonarchTokensProvider(RULE_LANGUAGE_ID, {
        tokenizer: {
            root: [
                [/[a-zA-Z_][a-zA-Z0-9_]*(?:\s+[a-zA-Z0-9_]+)*/, 'identifier'],
                [/[0-9]/, 'number'],
                [/[:]/, 'delimiter'],
                [/[()]/, 'delimiter.parenthesis'],
                [/[!&|]/, 'operator'],
            ],
        },
    })

    monacoInstance.languages.registerCompletionItemProvider(RULE_LANGUAGE_ID, {
        triggerCharacters: [' ', ':', '&', '|', '!', '('],
        provideCompletionItems(model, position) {
            const suggestionContext = suggestionsByModelUri.get(
                model.uri.toString()
            ) ?? {
                variables: [],
                variableActivityLevels: {},
            }
            const linePrefix = model
                .getLineContent(position.lineNumber)
                .slice(0, position.column - 1)
            const wordUntilPosition = model.getWordUntilPosition(position)
            const range = {
                startLineNumber: position.lineNumber,
                endLineNumber: position.lineNumber,
                startColumn: wordUntilPosition.startColumn,
                endColumn: wordUntilPosition.endColumn,
            }
            const completedConditionMatch =
                new RegExp(
                    `(?:^|[\\s(&|!]+)${VARIABLE_NAME_PATTERN}\\s*:\\s*[0-9]+\\s*$`
                ).exec(linePrefix)
            const assignmentMatch = new RegExp(
                `(?:^|[\\s(&|!]+)(${VARIABLE_NAME_PATTERN})\\s*:\\s*$`
            ).exec(linePrefix)

            if (completedConditionMatch) {
                return {
                    suggestions: [
                        {
                            label: '&&',
                            kind: monacoInstance.languages.CompletionItemKind
                                .Operator,
                            insertText: '&& ',
                            range,
                        },
                        {
                            label: '||',
                            kind: monacoInstance.languages.CompletionItemKind
                                .Operator,
                            insertText: '|| ',
                            range,
                        },
                        {
                            label: '!',
                            kind: monacoInstance.languages.CompletionItemKind
                                .Operator,
                            insertText: '! ',
                            range,
                        },
                    ],
                }
            }

            if (assignmentMatch) {
                const [, variableName] = assignmentMatch
                const maxActivityLevel =
                    suggestionContext.variableActivityLevels[variableName]

                if (maxActivityLevel) {
                    return {
                        suggestions: Array.from(
                            { length: maxActivityLevel },
                            (_, index) => ({
                                label: String(index + 1),
                                kind: monacoInstance.languages
                                    .CompletionItemKind.Value,
                                insertText: String(index + 1),
                                range,
                            })
                        ),
                    }
                }
            }

            return {
                suggestions: Array.from(
                    new Set(suggestionContext.variables)
                ).map((suggestion) => ({
                    label: suggestion,
                    kind: monacoInstance.languages.CompletionItemKind.Variable,
                    insertText: suggestion,
                    range,
                })),
            }
        },
    })

    monacoInstance.editor.defineTheme(RULE_THEME_ID, {
        base: 'vs',
        inherit: true,
        rules: [
            { token: 'number', foreground: 'c27d2c' },
            { token: 'operator', foreground: '2f81ed' },
            { token: 'delimiter.parenthesis', foreground: '8f6feb' },
            { token: 'delimiter', foreground: '475569' },
        ],
        colors: {
            'editor.background': '#fbfcfd',
            'editorLineNumber.foreground': '#94a3b8',
            'editorLineNumber.activeForeground': '#64748b',
            'editorCursor.foreground': '#0f172a',
            'editor.selectionBackground': '#2f81ed33',
            'editor.inactiveSelectionBackground': '#2f81ed1f',
            'editorSuggestWidget.background': '#ffffff',
            'editorSuggestWidget.border': '#d7dee8',
            'editorSuggestWidget.foreground': '#0f172a',
            'editorSuggestWidget.selectedBackground': '#eaf3ff',
            'editorSuggestWidget.selectedForeground': '#0f172a',
            'editorSuggestWidget.highlightForeground': '#2f81ed',
        },
    })

    setupState.isRegistered = true
}
