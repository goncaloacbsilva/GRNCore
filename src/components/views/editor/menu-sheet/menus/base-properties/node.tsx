import { useAppForm } from '@/components/forms'
import { getNodeContentMinWidth } from '@/components/views/editor/graph/utils'
import { FieldGroup } from '@/components/ui/field'
import { TabsContent } from '@/components/ui/tabs'
import {
    type EditableRegulatoryEdge,
    type RegulatoryNodeProperties,
    RegulatoryNodePropertiesSchema,
} from '@/lib/schema'
import { useStore as useFormStore } from '@tanstack/react-form'
import { useStore, useReactFlow, type Edge, type Node } from '@xyflow/react'
import { useEffect, useRef } from 'react'
import { shallow } from 'zustand/shallow'

interface NodeBasePropertiesMenuProps {
    node: Node<RegulatoryNodeProperties>
}

export function NodeBasePropertiesMenu({ node }: NodeBasePropertiesMenuProps) {
    const { updateNode, getNode } =
        useReactFlow<Node<RegulatoryNodeProperties>>()
    const persistNodeData = (values: RegulatoryNodeProperties) => {
        updateNode(node.id, (currentNode) => ({
            data: values,
            style: {
                ...currentNode.style,
                width: getNodeContentMinWidth(values.name),
            },
        }))
    }
    const outgoingEdges = useStore(
        (state) =>
            state.edges.filter(
                (edge) => edge.source === node.id
            ) as Edge<EditableRegulatoryEdge>[],
        shallow
    )

    const incomingEdges = useStore(
        (state) =>
            state.edges.filter(
                (edge) => edge.target === node.id
            ) as Edge<EditableRegulatoryEdge>[],
        shallow
    )

    const activityLevelsSchema =
        RegulatoryNodePropertiesSchema.shape.activityLevels.unwrap()
    const baseMinActivityLevels = activityLevelsSchema.minValue ?? 1
    const minActivityLevels = Math.max(
        baseMinActivityLevels,
        ...outgoingEdges.flatMap(
            (edge) => edge.data?.levels.map((level) => level.target) ?? []
        )
    )

    const form = useAppForm({
        defaultValues: node.data,
        validators: {
            onChange: RegulatoryNodePropertiesSchema,
        },
        listeners: {
            onBlur: ({ formApi }) => {
                if (formApi.state.isFormValid) {
                    persistNodeData(formApi.state.values)
                }
            },
        },
    })
    const formValues = useFormStore(form.store, (state) => state.values)
    const isFormTouched = useFormStore(form.store, (state) => state.isTouched)
    const isFormValid = useFormStore(form.store, (state) => state.isValid)
    const currentActivityLevels = useFormStore(
        form.store,
        (state) => state.values.activityLevels ?? baseMinActivityLevels
    )
    const previousIsInputNodeRef = useRef(formValues.isInputNode)

    useEffect(() => {
        const previousIsInputNode = previousIsInputNodeRef.current
        previousIsInputNodeRef.current = formValues.isInputNode

        if (
            previousIsInputNode === formValues.isInputNode ||
            !isFormTouched ||
            !isFormValid
        ) {
            return
        }

        persistNodeData(formValues)
    }, [formValues, isFormTouched, isFormValid])

    const isAtEdgeTargetBoundary =
        minActivityLevels > baseMinActivityLevels &&
        currentActivityLevels <= minActivityLevels

    return (
        <TabsContent value="base">
            <FieldGroup className="px-4 gap-4">
                <form.AppField
                    name="isInputNode"
                    children={(field) => (
                        <field.CheckboxField
                            label="Input Node"
                            disabled={incomingEdges.length > 0}
                            description={
                                field.state.value
                                    ? 'The behavior of this node is determined by external factors.'
                                    : ''
                            }
                            disabledTooltip={
                                <p>
                                    Input nodes cannot have incoming edges.
                                    <br />
                                    Remove the following edges before changing
                                    this property:
                                    <ul className="list-disc ps-4 mt-2">
                                        {incomingEdges.map((edge) => (
                                            <li key={edge.id}>
                                                <strong>
                                                    {
                                                        getNode(edge.source)
                                                            ?.data.name
                                                    }{' '}
                                                    -{'>'} {node.data.name}
                                                </strong>
                                            </li>
                                        ))}
                                    </ul>
                                </p>
                            }
                        />
                    )}
                />
                <form.AppField
                    name="name"
                    children={(field) => (
                        <field.TextField label="Name" placeholder="" />
                    )}
                />
                <form.AppField
                    name="activityLevels"
                    children={(field) => (
                        <field.NumberField
                            label="Activity Levels"
                            placeholder=""
                            min={minActivityLevels}
                            max={activityLevelsSchema.maxValue ?? undefined}
                            decrementTooltip={
                                isAtEdgeTargetBoundary ? (
                                    <p>
                                        Remove the levels targeting this value
                                        in the <br /> following edges before
                                        decreasing it:
                                        <ul className="list-disc ps-4 mt-2">
                                            {outgoingEdges.map((edge) => (
                                                <li key={edge.id}>
                                                    <strong>
                                                        {node.data.name} -{'>'}{' '}
                                                        {
                                                            getNode(edge.target)
                                                                ?.data.name
                                                        }
                                                    </strong>
                                                </li>
                                            ))}
                                        </ul>
                                    </p>
                                ) : undefined
                            }
                        />
                    )}
                />
            </FieldGroup>
        </TabsContent>
    )
}
