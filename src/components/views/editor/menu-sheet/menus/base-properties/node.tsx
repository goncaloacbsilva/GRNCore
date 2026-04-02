import { useAppForm } from '@/components/forms'
import { getNodeContentMinWidth } from '@/components/views/editor/graph/utils'
import { FieldGroup } from '@/components/ui/field'
import { TabsContent } from '@/components/ui/tabs'
import {
    type RegulatoryNodeProperties,
    RegulatoryNodePropertiesSchema,
} from '@/lib/schema'
import { useReactFlow, type Node } from '@xyflow/react'

interface NodeBasePropertiesMenuProps {
    node: Node<RegulatoryNodeProperties>
}

export function NodeBasePropertiesMenu({ node }: NodeBasePropertiesMenuProps) {
    const { updateNode } = useReactFlow()
    const activityLevelsSchema =
        RegulatoryNodePropertiesSchema.shape.activityLevels.unwrap()

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
                            min={activityLevelsSchema.minValue ?? undefined}
                            max={activityLevelsSchema.maxValue ?? undefined}
                        />
                    )}
                />
            </FieldGroup>
        </TabsContent>
    )
}
