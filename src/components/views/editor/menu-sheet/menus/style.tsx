import { useAppForm } from '@/components/forms'
import { FieldGroup } from '@/components/ui/field'
import { TabsContent } from '@/components/ui/tabs'
import {
    type EditableRegulatoryEdge,
    type RegulatoryNodeProperties,
} from '@/lib/schema'
import { useChangesTracking, useEditorStore } from '@/store'
import { useReactFlow, type Edge, type Node } from '@xyflow/react'
import { useEffect, useRef, type CSSProperties } from 'react'
import { useStore as useFormStore } from '@tanstack/react-form'
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
    {
        id: 'slate',
        label: 'Slate',
        foregroundColor: '#f8fafc',
        backgroundColor: '#334155',
        borderColor: '#0f172a',
    },
]

export function StyleMenu({ node }: StyleMenuProps) {
    const { updateNode, getNode, getNodes, getEdges } =
        useReactFlow<
            Node<RegulatoryNodeProperties>,
            Edge<EditableRegulatoryEdge>
        >()
    const setSnapshotPaused = useEditorStore((state) => state.setSnapshotPaused)
    const beginGroup = useChangesTracking((state) => state.beginGroup)
    const endGroup = useChangesTracking((state) => state.endGroup)

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

    const applyThemePreset = (preset: NodeThemePreset) => {
        runAsSingleStyleHistoryStep(() => {
            form.setFieldValue('foregroundColor', preset.foregroundColor)
            form.setFieldValue('backgroundColor', preset.backgroundColor)
            form.setFieldValue('borderColor', preset.borderColor)
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

        updateNode(node.id, (_currentNode) => ({
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
                    onPresetSelect={applyThemePreset}
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
    onPresetSelect: (preset: NodeThemePreset) => void
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
