import { REGULATORY_EDGE_STYLES, type RegulatoryEdgeStyle } from '../config'
import type { InteractionType } from '@/lib/schema'

type RegulatoryEdgeMarkerProps = {
    markerId: string
    interactionType: InteractionType
    color: string
}

function Vee({ color }: { color: string }) {
    return (
        <path
            d="M 10 5 Q 9.55 4.45 8.95 4.1 L 1 0.6 Q 0.45 0.35 0.6 0.95 L 2.4 5 Q 2.58 5.38 2.4 5.76 L 0.6 9.05 Q 0.45 9.65 1 9.4 L 8.95 5.9 Q 9.55 5.55 10 5 Z"
            fill={color}
        />
    )
}

function InhibitionMarker({ color }: { color: string }) {
    return <rect x="7.8" y="0.5" width="2.4" height="9" fill={color} />
}

function DualMarker({ color }: { color: string }) {
    return (
        <g>
            <path
                d="M 6.9 5 L 0 8.3 Q -0.6 8.5 -0.6 7.9 L -0.6 2.1 Q -0.6 1.5 0 1.7 Z"
                fill={color}
            />
            <rect
                x="-1.2"
                y="4.15"
                width="2.2"
                height="1.7"
                rx="0.85"
                fill={color}
            />
            <rect x="8" y="1" width="2" height="8" fill={color} />
        </g>
    )
}

function MarkerShape({
    type,
    color,
}: {
    type: RegulatoryEdgeStyle['endArrowType']
    color: string
}) {
    switch (type) {
        case 'rect':
            return <InhibitionMarker color={color} />
        case 'triangleRect':
            return <DualMarker color={color} />
        case 'vee':
        default:
            return <Vee color={color} />
    }
}

export function RegulatoryEdgeMarker({
    markerId,
    interactionType,
    color,
}: RegulatoryEdgeMarkerProps) {
    const markerStyle = REGULATORY_EDGE_STYLES[interactionType]
    const markerColor =
        markerStyle.endArrowStroke ?? markerStyle.endArrowFill ?? color

    return (
        <defs>
            <marker
                id={markerId}
                viewBox="0 0 10 10"
                refX="9"
                refY="5"
                markerUnits="strokeWidth"
                markerWidth="6.4"
                markerHeight="6.4"
                orient="auto"
            >
                <MarkerShape
                    type={markerStyle.endArrowType}
                    color={markerColor}
                />
            </marker>
        </defs>
    )
}
