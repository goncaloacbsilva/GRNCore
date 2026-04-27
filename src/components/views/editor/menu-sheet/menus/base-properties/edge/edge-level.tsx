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
import { useEffect, useRef } from 'react'
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
    const hasTargetConflict =
        edge.data?.levels.some(
            (currentLevel) =>
                currentLevel.id !== level.id &&
                currentLevel.target === level.target
        ) ?? false
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
    })

    const interactionType = useStore(form.store, (state) => state.values.type)
    const formValues = useStore(form.store, (state) => state.values)
    const isTouched = useStore(form.store, (state) => state.isTouched)
    const previousValuesRef = useRef(formValues)
    const maxTargetLevel =
        sourceNode?.data.activityLevels ??
        activityLevelsSchema.maxValue ??
        undefined
    const isAtMaxTargetLevel =
        maxTargetLevel !== undefined &&
        (formValues.target ?? activityLevelsSchema.minValue ?? 1) >=
            maxTargetLevel

    useEffect(() => {
        if (!hasTargetConflict && !isTouched) {
            return
        }

        if (hasTargetConflict) {
            form.setFieldMeta('target', (prev) => ({
                ...prev,
                isTouched: true,
            }))
        }

        void form.validateField('target', 'change')
    }, [form, hasTargetConflict, isTouched])

    useEffect(() => {
        const valuesChanged = previousValuesRef.current !== formValues
        previousValuesRef.current = formValues

        if (
            !valuesChanged ||
            !isTouched ||
            !activityLevelsSchema.safeParse(formValues.target).success
        ) {
            return
        }

        const hasConflict =
            edge.data?.levels.some(
                (currentLevel) =>
                    currentLevel.id !== level.id &&
                    currentLevel.target === formValues.target
            ) ?? false
        const isWithinSourceRange =
            maxTargetLevel === undefined || formValues.target <= maxTargetLevel

        updateCallback(level.id, {
            ...formValues,
            isValid: !hasConflict && isWithinSourceRange,
        })
    }, [
        edge.data?.levels,
        formValues,
        isTouched,
        level.id,
        maxTargetLevel,
        updateCallback,
    ])

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
                                    max={maxTargetLevel}
                                    incrementTooltip={
                                        isAtMaxTargetLevel ? (
                                            <p>
                                                Target level can't be greater
                                                than the source node activity
                                                levels
                                            </p>
                                        ) : undefined
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
                                    aria-label="Interaction type"
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
