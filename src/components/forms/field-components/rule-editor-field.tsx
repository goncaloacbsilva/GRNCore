import Editor, { loader } from '@monaco-editor/react'
import * as monaco from 'monaco-editor'
import { useEffect, useId, useState } from 'react'
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
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip'

loader.config({ monaco })

const MIN_EDITOR_HEIGHT = 32

interface RuleEditorFieldProps {
    label: string
    description?: string
    tooltip?: React.ReactElement
    placeholder: string
    variableSuggestions?: string[]
    variableActivityLevels?: Record<string, number>
    onBlur?: () => void
}

export function RuleEditorField({
    label,
    placeholder,
    description,
    tooltip,
    variableSuggestions = [],
    variableActivityLevels = {},
    onBlur,
}: RuleEditorFieldProps) {
    const field = useFieldContext<string>()
    const editorId = useId().replace(/:/g, '-')
    const modelPath = `inmemory://model/regulatory-rule-${editorId}`
    const normalizedValue = (field.state.value ?? '').replace(/\r?\n+/g, ' ')
    const [editorHeight, setEditorHeight] = useState(MIN_EDITOR_HEIGHT)

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
            <Tooltip>
                <TooltipTrigger>
                    <div
                        className={cn(
                            'relative overflow-visible rounded-md border bg-[#fbfcfd] shadow-xs',
                            isInvalid ? 'border-destructive' : 'border-input'
                        )}
                    >
                        <div className="overflow-hidden rounded-[inherit]">
                            <Editor
                                beforeMount={ensureRegulatoryRuleEditorSetup}
                                path={modelPath}
                                language={RULE_LANGUAGE_ID}
                                theme={RULE_THEME_ID}
                                value={normalizedValue}
                                onChange={(value) =>
                                    field.handleChange(
                                        (value ?? '').replace(/\r?\n+/g, ' ')
                                    )
                                }
                                onMount={(editor) => {
                                    const updateEditorHeight = () => {
                                        setEditorHeight(
                                            Math.max(
                                                MIN_EDITOR_HEIGHT,
                                                Math.ceil(
                                                    editor.getContentHeight()
                                                )
                                            )
                                        )
                                    }

                                    updateEditorHeight()
                                    editor.onDidContentSizeChange(
                                        updateEditorHeight
                                    )
                                    editor.addCommand(
                                        monaco.KeyCode.Enter,
                                        () => {
                                            field.handleBlur()
                                            editor.getDomNode()?.blur()
                                        },
                                        '!suggestWidgetVisible'
                                    )
                                    editor.onDidBlurEditorText(() => {
                                        field.handleBlur()
                                        onBlur?.()
                                    })
                                }}
                                options={{
                                    automaticLayout: true,
                                    fixedOverflowWidgets: true,
                                    minimap: { enabled: false },
                                    scrollBeyondLastLine: false,
                                    wordWrap: 'on',
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
                                    lightbulb: {
                                        enabled:
                                            monaco.editor.ShowLightbulbIconMode
                                                .Off,
                                    },
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
                                    fontSize: 13,
                                    lineHeight: 18,
                                    padding: {
                                        top: 6,
                                        bottom: 6,
                                    },
                                    tabSize: 2,
                                    insertSpaces: true,
                                    placeholder,
                                }}
                                height={`${editorHeight}px`}
                            />
                        </div>
                    </div>
                </TooltipTrigger>
                <TooltipContent>{tooltip}</TooltipContent>
            </Tooltip>
            {isInvalid && <FieldError errors={field.state.meta.errors} />}
        </Field>
    )
}
