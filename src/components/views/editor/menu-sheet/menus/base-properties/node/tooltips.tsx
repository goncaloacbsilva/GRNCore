import type {
    EditableRegulatoryEdge,
    RegulatoryNodeProperties,
} from '@/lib/schema'
import { useReactFlow, type Edge, type Node } from '@xyflow/react'

interface NodeTooltipContentProps {
    edges: Edge<EditableRegulatoryEdge>[]
    node: Node<RegulatoryNodeProperties>
}

export function NodeIncomingEdgesTooltipContent({
    edges,
    node,
}: NodeTooltipContentProps) {
    const { getNode } = useReactFlow<Node<RegulatoryNodeProperties>>()

    return (
        <p>
            Input nodes cannot have incoming edges.
            <br />
            Remove the following edges before changing this property:
            <ul className="list-disc ps-4 mt-2">
                {edges.map((edge) => (
                    <li key={edge.id}>
                        <strong>
                            {getNode(edge.source)?.data.name} -{'>'}{' '}
                            {node.data.name}
                        </strong>
                    </li>
                ))}
            </ul>
        </p>
    )
}

export function NodeOutgoingEdgesTooltipContent({
    edges,
    node,
}: NodeTooltipContentProps) {
    const { getNode } = useReactFlow<Node<RegulatoryNodeProperties>>()

    return (
        <p>
            Remove the levels targeting this value in the <br /> following edges
            before decreasing it:
            <ul className="list-disc ps-4 mt-2">
                {edges.map((edge) => (
                    <li key={edge.id}>
                        <strong>
                            {node.data.name} -{'>'}{' '}
                            {getNode(edge.target)?.data.name}
                        </strong>
                    </li>
                ))}
            </ul>
        </p>
    )
}
