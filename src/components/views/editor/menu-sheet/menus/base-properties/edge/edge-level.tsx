import { useAppForm } from '@/components/forms'
import { InteractionLabel } from '@/components/shared'
import { Button } from '@/components/ui/button'
import { FieldGroup } from '@/components/ui/field'
import { Item, ItemContent, ItemFooter } from '@/components/ui/item'
import { Separator } from '@/components/ui/separator'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import {
    RegulatoryEdgeLevelSchema,
    type EditableRegulatoryEdge,
    type InteractionType,
    type RegulatoryNodeProperties,
} from '@/lib/schema'
import { useStore } from '@tanstack/react-form'
import { type Edge, type Node } from '@xyflow/react'
import { XIcon } from 'lucide-react'
import { Fragment } from 'react/jsx-runtime'
import { twJoin } from 'tailwind-merge'

const activityLevelsSchema = RegulatoryEdgeLevelSchema.shape.target

interface EdgeLevelProps {
    levelKey: number
    level: EditableRegulatoryEdge['levels'][number]
    edge: Edge<EditableRegulatoryEdge>
    sourceNode?: Node<RegulatoryNodeProperties>
    updateCallback: (
        levelId: string,
        level: EditableRegulatoryEdge['levels'][number]
    ) => void
    removeCallback: (levelId: string) => void
}

export function EdgeLevel({
    levelKey,
    level,
    edge,
    sourceNode,
    updateCallback,
    removeCallback,
}: EdgeLevelProps) {
    const form = useAppForm({
        defaultValues: level,
        validators: {
            onChange: ({ value, formApi }) => {
                const schemaErrors = formApi.parseValuesWithSchema(
                    RegulatoryEdgeLevelSchema
                )
                const conflict = edge.data?.levels.some(
                    (l) => l.id !== level.id && l.target === value.target
                )

                return {
                    fields: {
                        ...schemaErrors?.fields,
                        ...(conflict && {
                            target: [
                                ...(schemaErrors?.fields?.target ?? []),
                                {
                                    message: 'Target level value conflict',
                                },
                            ],
                        }),
                    },
                }
            },
        },
        listeners: {
            onChange: ({ formApi }) => {
                if (formApi.state.isFormValid) {
                    updateCallback(level.id, formApi.state.values)
                }
            },
        },
    })

    const interactionType = useStore(form.store, (state) => state.values.type)

    return (
        <Fragment key={levelKey}>
            <Item variant="default" size="sm" className="group">
                <ItemContent className="flex flex-col items-center gap-2">
                    <FieldGroup className="flex flex-col items-center gap-4">
                        <form.AppField
                            name="target"
                            children={(field) => (
                                <field.NumberField
                                    label="Target Level"
                                    placeholder=""
                                    min={
                                        activityLevelsSchema.minValue ??
                                        undefined
                                    }
                                    max={
                                        sourceNode?.data.activityLevels ??
                                        activityLevelsSchema.maxValue ??
                                        undefined
                                    }
                                />
                            )}
                        />
                        <form.AppField
                            name="type"
                            children={(field) => (
                                <ToggleGroup
                                    className="flex flex-row w-full justify-center"
                                    variant="outline"
                                    type="single"
                                    value={field.state.value}
                                    onValueChange={(type) => {
                                        if (!type) return
                                        field.handleChange(
                                            type as InteractionType
                                        )
                                    }}
                                >
                                    <ToggleGroupItem
                                        className="w-32 data-[state=on]:bg-transparent"
                                        value="activation"
                                        aria-label="Toggle activation"
                                    >
                                        <InteractionLabel
                                            type="activation"
                                            selectedType={interactionType}
                                        />
                                    </ToggleGroupItem>
                                    <ToggleGroupItem
                                        className="w-31 data-[state=on]:bg-transparent"
                                        value="inhibition"
                                        aria-label="Toggle inhibition"
                                    >
                                        <InteractionLabel
                                            type="inhibition"
                                            selectedType={interactionType}
                                        />
                                    </ToggleGroupItem>
                                </ToggleGroup>
                            )}
                        />
                    </FieldGroup>
                </ItemContent>
                <ItemFooter className="flex flex-col items-center">
                    <Button
                        variant="ghost"
                        size="xs"
                        className={twJoin(
                            'hidden flex-row',
                            (edge.data?.levels.length ?? 1) > 1 &&
                                'group-hover:flex'
                        )}
                        onClick={() => removeCallback(level.id)}
                    >
                        <XIcon />
                        Remove
                    </Button>
                </ItemFooter>
            </Item>
            <Separator className="my-1" />
        </Fragment>
    )
}
