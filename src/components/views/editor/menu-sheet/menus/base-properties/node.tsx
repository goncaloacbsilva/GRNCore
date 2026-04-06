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
import { shallow } from 'zustand/shallow'

interface NodeBasePropertiesMenuProps {
    node: Node<RegulatoryNodeProperties>
}

export function NodeBasePropertiesMenu({ node }: NodeBasePropertiesMenuProps) {
    const { updateNode, getNode } =
        useReactFlow<Node<RegulatoryNodeProperties>>()
    const outgoingEdges = useStore(
        (state) =>
            state.edges.filter(
                (edge) => edge.source === node.id
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
                    updateNode(node.id, (currentNode) => ({
                        data: formApi.state.values,
                        style: {
                            ...currentNode.style,
                            width: getNodeContentMinWidth(
                                formApi.state.values.name
                            ),
                        },
                    }))
                }
            },
        },
    })
    const currentActivityLevels = useFormStore(
        form.store,
        (state) => state.values.activityLevels ?? baseMinActivityLevels
    )
    const isAtEdgeTargetBoundary =
        minActivityLevels > baseMinActivityLevels &&
        currentActivityLevels <= minActivityLevels

    return (
        <TabsContent value="base">
            <FieldGroup className="px-4 gap-4">
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
