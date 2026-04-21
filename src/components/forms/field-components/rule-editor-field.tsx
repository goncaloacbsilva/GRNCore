import Editor, { loader } from '@monaco-editor/react'
import * as monaco from 'monaco-editor'
import { useEffect, useId } from 'react'
import {
    Field,
    FieldDescription,
    FieldError,
    FieldLabel,
} from '@/components/ui/field'
import {
    clearRegulatoryRuleSuggestions,
    ensureRegulatoryRuleEditorSetup,
    RULE_LANGUAGE_ID,
    RULE_THEME_ID,
    setRegulatoryRuleSuggestions,
} from '@/lib/regulatory-rules'
import { cn } from '@/lib/utils'
import { useFieldContext } from '../form-context'

loader.config({ monaco })

interface RuleEditorFieldProps {
    label: string
    description?: string
    placeholder: string
    variableSuggestions?: string[]
    variableActivityLevels?: Record<string, number>
}

export function RuleEditorField({
    label,
    placeholder,
    description,
    variableSuggestions = [],
    variableActivityLevels = {},
}: RuleEditorFieldProps) {
    const field = useFieldContext<string>()
    const editorId = useId().replace(/:/g, '-')
    const modelPath = `inmemory://model/regulatory-rule-${editorId}`

    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

    useEffect(() => {
        setRegulatoryRuleSuggestions(modelPath, {
            variables: variableSuggestions,
            variableActivityLevels,
        })

        return () => {
            clearRegulatoryRuleSuggestions(modelPath)
        }
    }, [modelPath, variableActivityLevels, variableSuggestions])

    return (
        <Field data-invalid={isInvalid}>
            <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
            {description && <FieldDescription>{description}</FieldDescription>}
            <div
                className={cn(
                    'relative overflow-hidden rounded-md border bg-[#fbfcfd] shadow-xs',
                    isInvalid ? 'border-destructive' : 'border-input'
                )}
            >
                <Editor
                    beforeMount={ensureRegulatoryRuleEditorSetup}
                    path={modelPath}
                    language={RULE_LANGUAGE_ID}
                    theme={RULE_THEME_ID}
                    value={field.state.value}
                    onChange={(value) => field.handleChange(value ?? '')}
                    onBlur={field.handleBlur}
                    loading={null}
                    options={{
                        automaticLayout: true,
                        fixedOverflowWidgets: true,
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        wordWrap: 'off',
                        wrappingStrategy: 'advanced',
                        lineNumbers: 'off',
                        lineDecorationsWidth: 8,
                        glyphMargin: false,
                        folding: false,
                        contextmenu: false,
                        renderLineHighlight: 'none',
                        overviewRulerBorder: false,
                        overviewRulerLanes: 0,
                        hideCursorInOverviewRuler: true,
                        quickSuggestions: {
                            other: true,
                            comments: false,
                            strings: false,
                        },
                        parameterHints: { enabled: false },
                        suggestOnTriggerCharacters: true,
                        hover: { enabled: false },
                        codeLens: false,
                        lightbulb: { enabled: 'off' },
                        wordBasedSuggestions: 'off',
                        suggest: {
                            showWords: false,
                            showStatusBar: false,
                            preview: false,
                            showIcons: false,
                            showInlineDetails: false,
                        },
                        suggestFontSize: 11,
                        suggestLineHeight: 18,
                        guides: { indentation: false },
                        scrollbar: {
                            verticalScrollbarSize: 8,
                            horizontalScrollbarSize: 8,
                        },
                        fontFamily:
                            'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, monospace',
                        fontSize: 12,
                        lineHeight: 20,
                        padding: {
                            top: 8,
                            bottom: 8,
                        },
                        tabSize: 2,
                        insertSpaces: true,
                        placeholder,
                    }}
                    height="100px"
                />
            </div>
            {isInvalid && <FieldError errors={field.state.meta.errors} />}
        </Field>
    )
}
