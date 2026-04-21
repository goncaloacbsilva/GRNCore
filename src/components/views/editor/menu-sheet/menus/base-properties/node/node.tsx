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
import { useCallback, useEffect, useRef } from 'react'
import * as z from 'zod'
import { shallow } from 'zustand/shallow'
import { NodeRules } from './node-rules'
import {
    NodeIncomingEdgesTooltipContent,
    NodeOutgoingEdgesTooltipContent,
} from './tooltips'

interface NodeBasePropertiesMenuProps {
    node: Node<RegulatoryNodeProperties>
}

const NodeBasePropertiesFormSchema = z.object({
    name: RegulatoryNodePropertiesSchema.shape.name,
    activityLevels:
        RegulatoryNodePropertiesSchema.shape.activityLevels.unwrap(),
    isInputNode: RegulatoryNodePropertiesSchema.shape.isInputNode.unwrap(),
})

export function NodeBasePropertiesMenu({ node }: NodeBasePropertiesMenuProps) {
    const { getNode, updateNode } =
        useReactFlow<Node<RegulatoryNodeProperties>>()
    const nodeData = RegulatoryNodePropertiesSchema.parse(node.data)
    const persistNodeData = useCallback(
        (
            values: Pick<
                RegulatoryNodeProperties,
                'name' | 'activityLevels' | 'isInputNode'
            >
        ) => {
            updateNode(node.id, (currentNode) => ({
                data: {
                    ...currentNode.data,
                    ...values,
                },
                style: {
                    ...currentNode.style,
                    width: getNodeContentMinWidth(values.name),
                },
            }))
        },
        [node.id, updateNode]
    )
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
        defaultValues: {
            name: nodeData.name,
            activityLevels: nodeData.activityLevels,
            isInputNode: nodeData.isInputNode,
        },
        validators: {
            onChange: ({ formApi }) =>
                formApi.parseValuesWithSchema(NodeBasePropertiesFormSchema),
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
    const currentIsInputNode = useFormStore(
        form.store,
        (state) => state.values.isInputNode
    )
    const previousIsInputNodeRef = useRef(formValues.isInputNode)
    const currentNodeData: RegulatoryNodeProperties = {
        ...nodeData,
        ...formValues,
    }
    const variableSuggestions = Array.from(
        new Set(
            incomingEdges
                .map((edge) => getNode(edge.source)?.data.name)
                .filter((name): name is string => Boolean(name))
        )
    )
    const variableActivityLevels = Object.fromEntries(
        incomingEdges.flatMap((edge) => {
            const sourceNode = getNode(edge.source)
            const sourceName = sourceNode?.data.name

            return sourceName
                ? [[sourceName, sourceNode.data.activityLevels]]
                : []
        })
    )

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
    }, [formValues, isFormTouched, isFormValid, persistNodeData])

    const isAtEdgeTargetBoundary =
        minActivityLevels > baseMinActivityLevels &&
        currentActivityLevels <= minActivityLevels

    return (
        <TabsContent
            value="base"
            className="px-4 pb-4 flex h-full min-h-0 flex-col gap-5"
        >
            <FieldGroup className="gap-5">
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
                                    <NodeOutgoingEdgesTooltipContent
                                        edges={outgoingEdges}
                                        node={node}
                                    />
                                ) : undefined
                            }
                        />
                    )}
                />
                <form.AppField
                    name="isInputNode"
                    children={(field) => (
                        <field.CheckboxField
                            label="Input Node"
                            description={
                                field.state.value
                                    ? 'The behavior of this node is determined by external factors.'
                                    : ''
                            }
                            disabled={incomingEdges.length > 0}
                            disabledTooltip={
                                <NodeIncomingEdgesTooltipContent
                                    edges={incomingEdges}
                                    node={node}
                                />
                            }
                        />
                    )}
                />
            </FieldGroup>
            {!currentIsInputNode && (
                <NodeRules
                    node={{ ...node, data: currentNodeData }}
                    variableSuggestions={variableSuggestions}
                    variableActivityLevels={variableActivityLevels}
                />
            )}
        </TabsContent>
    )
}
