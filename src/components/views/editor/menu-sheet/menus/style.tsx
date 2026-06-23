import { useAppForm } from '@/components/forms'
import { Button } from '@/components/ui/button'
import { FieldGroup } from '@/components/ui/field'
import { TabsContent } from '@/components/ui/tabs'
import {
    type EditableRegulatoryEdge,
    type RegulatoryNodeProperties,
} from '@/lib/schema'
import {
    useChangesTracking,
    useEditorStore,
    type CustomNodeTheme,
} from '@/store'
import { useReactFlow, type Edge, type Node } from '@xyflow/react'
import { PlusIcon, Trash2Icon } from 'lucide-react'
import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { useStore as useFormStore } from '@tanstack/react-form'
import { toast } from 'sonner'
import {
    DEFAULT_NODE_BACKGROUND_COLOR,
    DEFAULT_NODE_BORDER_COLOR,
    DEFAULT_NODE_FOREGROUND_COLOR,
    getRegulatoryNodeBackgroundColor,
    getRegulatoryNodeBorderColor,
    NODE_BACKGROUND_COLOR_STYLE_PROPERTY,
    NODE_BORDER_COLOR_STYLE_PROPERTY,
    type RegulatoryNodeStyle,
} from '../../graph/node-style'

interface StyleMenuProps {
    node: Node<RegulatoryNodeProperties>
}

interface NodeThemePreset {
    id: string
    label: string
    foregroundColor: string
    backgroundColor: string
    borderColor: string
}

type NodeThemeColors = Pick<
    NodeThemePreset,
    'foregroundColor' | 'backgroundColor' | 'borderColor'
>

const NODE_THEME_PRESETS: NodeThemePreset[] = [
    {
        id: 'default',
        label: 'Default',
        foregroundColor: DEFAULT_NODE_FOREGROUND_COLOR,
        backgroundColor: DEFAULT_NODE_BACKGROUND_COLOR,
        borderColor: DEFAULT_NODE_BORDER_COLOR,
    },
    {
        id: 'blue',
        label: 'Blue',
        foregroundColor: '#0f172a',
        backgroundColor: '#dbeafe',
        borderColor: '#60a5fa',
    },
    {
        id: 'green',
        label: 'Green',
        foregroundColor: '#052e16',
        backgroundColor: '#dcfce7',
        borderColor: '#4ade80',
    },
    {
        id: 'amber',
        label: 'Amber',
        foregroundColor: '#451a03',
        backgroundColor: '#fef3c7',
        borderColor: '#f59e0b',
    },
    {
        id: 'rose',
        label: 'Rose',
        foregroundColor: '#4c0519',
        backgroundColor: '#ffe4e6',
        borderColor: '#fb7185',
    },
]

export function StyleMenu({ node }: StyleMenuProps) {
    const { updateNode, getNode, getNodes, getEdges } = useReactFlow<
        Node<RegulatoryNodeProperties>,
        Edge<EditableRegulatoryEdge>
    >()
    const {
        setSnapshotPaused,
        customNodeThemes,
        addCustomNodeTheme,
        removeCustomNodeTheme,
    } = useEditorStore((state) => ({
        setSnapshotPaused: state.setSnapshotPaused,
        customNodeThemes: state.customNodeThemes,
        addCustomNodeTheme: state.addCustomNodeTheme,
        removeCustomNodeTheme: state.removeCustomNodeTheme,
    }))
    const beginGroup = useChangesTracking((state) => state.beginGroup)
    const endGroup = useChangesTracking((state) => state.endGroup)
    const [selectedCustomThemeId, setSelectedCustomThemeId] = useState<
        string | null
    >(null)

    const form = useAppForm({
        defaultValues: {
            foregroundColor:
                typeof node.style?.color === 'string'
                    ? node.style.color
                    : DEFAULT_NODE_FOREGROUND_COLOR,
            backgroundColor: getRegulatoryNodeBackgroundColor(node.style),
            borderColor: getRegulatoryNodeBorderColor(node.style),
        },
    })

    const formValues = useFormStore(form.store, (state) => state.values)
    const isFormTouched = useFormStore(form.store, (state) => state.isTouched)
    const hasInitializedStyleSyncRef = useRef(false)
    const runAsSingleStyleHistoryStep = (fn: () => void) => {
        beginGroup('style-preset-change', getNodes(), getEdges())
        setSnapshotPaused(true)
        fn()

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                endGroup(getNodes(), getEdges())
                setSnapshotPaused(false)
            })
        })
    }

    const applyThemePreset = (preset: NodeThemeColors) => {
        runAsSingleStyleHistoryStep(() => {
            form.setFieldValue('foregroundColor', preset.foregroundColor)
            form.setFieldValue('backgroundColor', preset.backgroundColor)
            form.setFieldValue('borderColor', preset.borderColor)
        })
    }

    const applyDefaultThemePreset = (preset: NodeThemeColors) => {
        setSelectedCustomThemeId(null)
        applyThemePreset(preset)
    }

    const saveCustomTheme = () => {
        addCustomNodeTheme({
            id:
                typeof crypto !== 'undefined' && 'randomUUID' in crypto
                    ? crypto.randomUUID()
                    : `${Date.now()}`,
            foregroundColor: formValues.foregroundColor,
            backgroundColor: formValues.backgroundColor,
            borderColor: formValues.borderColor,
        })
    }

    useEffect(() => {
        if (!hasInitializedStyleSyncRef.current) {
            hasInitializedStyleSyncRef.current = true
            return
        }

        if (!isFormTouched) {
            return
        }

        const currentNode = getNode(node.id)
        if (!currentNode) {
            return
        }

        const nextStyle = {
            ...omitWrapperNodeColors(currentNode.style),
            color: formValues.foregroundColor,
            [NODE_BACKGROUND_COLOR_STYLE_PROPERTY]: formValues.backgroundColor,
            [NODE_BORDER_COLOR_STYLE_PROPERTY]: formValues.borderColor,
        } satisfies RegulatoryNodeStyle

        if (areStylesEqual(currentNode.style, nextStyle)) {
            return
        }

        updateNode(node.id, () => ({
            style: nextStyle,
        }))
    }, [formValues, getNode, isFormTouched, node.id, updateNode])

    return (
        <TabsContent
            value="style"
            className="px-4 pb-4 flex min-h-0 flex-col gap-5"
        >
            <FieldGroup className="gap-5">
                <ThemePalette
                    presets={NODE_THEME_PRESETS}
                    onPresetSelect={applyDefaultThemePreset}
                />
                <CustomThemePalette
                    selectedThemeId={selectedCustomThemeId}
                    onThemePick={setSelectedCustomThemeId}
                    themes={customNodeThemes}
                    onThemeSave={saveCustomTheme}
                    onThemeSelect={applyThemePreset}
                    onThemeDelete={removeCustomNodeTheme}
                />
                <form.AppField
                    name="foregroundColor"
                    children={(field) => (
                        <field.ColorPickerField label="Text" />
                    )}
                />
                <form.AppField
                    name="backgroundColor"
                    children={(field) => (
                        <field.ColorPickerField label="Background" />
                    )}
                />
                <form.AppField
                    name="borderColor"
                    children={(field) => (
                        <field.ColorPickerField label="Border" />
                    )}
                />
            </FieldGroup>
        </TabsContent>
    )
}

function ThemePalette({
    presets,
    onPresetSelect,
}: {
    presets: NodeThemePreset[]
    onPresetSelect: (preset: NodeThemeColors) => void
}) {
    return (
        <div className="flex flex-col gap-2">
            <h4 className="text-sm font-medium">Theme Palette</h4>
            <div className="flex flex-wrap gap-2">
                {presets.map((preset) => (
                    <button
                        key={preset.id}
                        type="button"
                        className="flex h-8 w-12 overflow-hidden rounded border-2 border-transparent hover:border-border focus:border-ring focus:outline-none"
                        onClick={() => onPresetSelect(preset)}
                        aria-label={`Select ${preset.label} theme`}
                        title={preset.label}
                    >
                        <span
                            className="h-full flex-1"
                            style={{ backgroundColor: preset.backgroundColor }}
                        />
                        <span
                            className="h-full w-2"
                            style={{ backgroundColor: preset.borderColor }}
                        />
                    </button>
                ))}
            </div>
        </div>
    )
}

function CustomThemePalette({
    selectedThemeId,
    onThemePick,
    themes,
    onThemeSave,
    onThemeSelect,
    onThemeDelete,
}: {
    selectedThemeId: string | null
    onThemePick: (themeId: string | null) => void
    themes: CustomNodeTheme[]
    onThemeSave: () => void
    onThemeSelect: (preset: NodeThemeColors) => void
    onThemeDelete: (themeId: string) => void
}) {
    return (
        <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-2">
                <h4 className="text-sm font-medium">Custom Themes</h4>
                <div className="flex flex-wrap gap-2">
                    <button
                        type="button"
                        className="text-muted-foreground hover:text-foreground flex h-8 w-12 items-center justify-center rounded border-2 border-dashed border-border/70 bg-muted/20 hover:border-border focus:border-ring focus:outline-none"
                        onClick={onThemeSave}
                        aria-label="Save current theme"
                        title="Save current theme"
                    >
                        <PlusIcon className="size-4" />
                    </button>
                    {themes.map((theme, index) => (
                        <div key={theme.id} className="relative h-8 w-12">
                            <button
                                type="button"
                                className={`flex h-8 w-12 overflow-hidden rounded border-2 hover:border-border focus:border-ring focus:outline-none ${
                                    selectedThemeId === theme.id
                                        ? 'border-ring'
                                        : 'border-transparent'
                                }`}
                                onClick={() => {
                                    onThemePick(theme.id)
                                    onThemeSelect(theme)
                                }}
                                aria-label={`Select custom theme ${index + 1}`}
                                title={`Custom theme ${index + 1}`}
                            >
                                <span
                                    className="h-full flex-1"
                                    style={{
                                        backgroundColor: theme.backgroundColor,
                                    }}
                                />
                                <span
                                    className="h-full w-2"
                                    style={{
                                        backgroundColor: theme.borderColor,
                                    }}
                                />
                            </button>
                            {selectedThemeId === theme.id ? (
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="icon-xs"
                                    className="absolute -top-1 -right-1 z-10 shadow-sm"
                                    onClick={() => {
                                        onThemeDelete(theme.id)
                                        onThemePick(null)
                                    }}
                                    aria-label={`Delete custom theme ${index + 1}`}
                                    title={`Delete custom theme ${index + 1}`}
                                >
                                    <Trash2Icon />
                                </Button>
                            ) : null}
                        </div>
                    ))}
                </div>
            </div>
            {themes.length === 0 ? (
                <p className="text-muted-foreground text-xs">
                    Save the current node colors to reuse them later.
                </p>
            ) : null}
        </div>
    )
}

function omitWrapperNodeColors(
    style: CSSProperties | undefined
): CSSProperties {
    if (!style) {
        return {}
    }

    const styleWithoutWrapperColors = { ...style }
    delete styleWithoutWrapperColors.backgroundColor
    delete styleWithoutWrapperColors.borderColor

    return styleWithoutWrapperColors
}

function normalizeStyle(style: CSSProperties | undefined): CSSProperties {
    if (!style) {
        return {}
    }

    const normalized = { ...style }
    Object.keys(normalized).forEach((key) => {
        if (normalized[key as keyof CSSProperties] === undefined) {
            delete normalized[key as keyof CSSProperties]
        }
    })

    return normalized
}

function areStylesEqual(
    currentStyle: CSSProperties | undefined,
    nextStyle: CSSProperties
) {
    const normalizedCurrent = normalizeStyle(currentStyle)
    const normalizedNext = normalizeStyle(nextStyle)
    const currentEntries = Object.entries(normalizedCurrent)
    const nextEntries = Object.entries(normalizedNext)

    if (currentEntries.length !== nextEntries.length) {
        return false
    }

    return nextEntries.every(
        ([key, value]) =>
            normalizedCurrent[key as keyof CSSProperties] === value
    )
}
