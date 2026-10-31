import {
    BaseEdge,
    type Edge,
    type EdgeProps,
    useInternalNode,
    useReactFlow,
    useStore,
} from '@xyflow/react'
import { shallow } from 'zustand/shallow'
import { InteractionType, type EditableRegulatoryEdge } from '@/lib/schema'
import { DEFAULT_ALGORITHM } from '@/lib/types'
import {
    useStableControlPointIds,
    getEditableControlPoints,
    getEditablePath,
    computeRegulatoryEdgeLayout,
} from '../utils'
import { useEdgeRenderMetadata } from '../edge-render-metadata'
import { REGULATORY_EDGE_STYLES, type RegulatoryEdgeStyle } from '../config'
import { RegulatoryEdgeMarker } from './regulatory-edge-marker'
import { AnchorHandle, ControlPointHandle } from './editable-edge-handles'
import {
    useRegulatoryEdgeActions,
    useRegulatoryEdgeSelection,
} from '../utils/use-regulatory-edge-interactions'

const REGULATORY_EDGE_STROKE_WIDTH = 1.5
const REGULATORY_EDGE_INTERACTION_WIDTH = 40
const REGULATORY_EDGE_HITBOX_WIDTH = 5

type RegulatoryGraphEdge = Edge<EditableRegulatoryEdge>

const EMPTY_EDGES: RegulatoryGraphEdge[] = []
const EMPTY_NODE_LOOKUP = new Map()
const EMPTY_SELF_LOOP_ROUTING = {
    edges: EMPTY_EDGES,
    nodeLookup: EMPTY_NODE_LOOKUP,
}

export function RegulatoryEdge({
    id,
    source,
    target,
    selected,
    markerStart,
    style,
    data,
}: EdgeProps<RegulatoryGraphEdge>) {
    const { getViewport, setEdges } = useReactFlow()
    const sourceNode = useInternalNode(source)!
    const targetNode = useInternalNode(target)!
    const parallelEdgeMeta = useEdgeRenderMetadata(id)
    const { userSelectionActive, userSelectionRect } = useStore(
        (state) => ({
            userSelectionActive: state.userSelectionActive,
            userSelectionRect: state.userSelectionRect,
        }),
        shallow
    )
    const selfLoopRouting = useStore(
        (state) =>
            source === target
                ? { edges: state.edges, nodeLookup: state.nodeLookup }
                : EMPTY_SELF_LOOP_ROUTING,
        shallow
    )
    const { centeredIndex } = parallelEdgeMeta

    const algorithm = data?.algorithm ?? DEFAULT_ALGORITHM
    const storedPoints = data?.points ?? []
    const isSelected = Boolean(selected)

    const regulatoryStyle = data
        ? determineRegulatoryEdgeStyle(data)
        : REGULATORY_EDGE_STYLES.activation
    const hasInvalidLevels =
        data?.levels.some((level) => !level.isValid) ?? false

    const {
        startHandleId,
        endHandleId,
        geometryStoredPoints,
        sourcePos,
        targetPos,
        sourcePoint,
        targetPoint,
        targetTipPoint,
        allPoints,
    } = computeRegulatoryEdgeLayout({
        id,
        source,
        target,
        algorithm,
        storedPoints,
        centeredIndex,
        sourceNode,
        targetNode,
        edges: selfLoopRouting.edges,
        nodeLookup: selfLoopRouting.nodeLookup,
        endArrowType: regulatoryStyle.endArrowType,
    })

    const controlPoints = useStableControlPointIds(
        getEditableControlPoints({
            points: allPoints,
            algorithm,
            sides: {
                fromSide: sourcePos,
                toSide: targetPos,
            },
        })
    )

    const editableControlPoints = controlPoints.filter(
        (point) => point.id !== startHandleId && point.id !== endHandleId
    )
    const startHandlePosition = sourcePoint
    const endHandlePosition = targetTipPoint

    const path = getEditablePath({
        points: allPoints,
        algorithm,
        sides: {
            fromSide: sourcePos,
            toSide: targetPos,
        },
    })

    const edgeColor =
        typeof style?.stroke === 'string'
            ? style.stroke
            : (regulatoryStyle.stroke ?? '#b1b1b7')

    const markerId = `${id}-marker`
    const { selectEdge, setControlPoints, setAnchorHint } =
        useRegulatoryEdgeActions({
            id,
            setEdges,
            startHandleId,
            endHandleId,
            fallbackGeometryStoredPoints: geometryStoredPoints,
            sourcePoint,
            targetPoint,
            sourceNode,
            targetNode,
        })
    useRegulatoryEdgeSelection({
        controlPoints: editableControlPoints,
        id,
        selected: isSelected,
        setEdges,
        getViewport,
        userSelectionActive,
        userSelectionRect,
    })
    const anchors = [
        { id: startHandleId, position: startHandlePosition },
        { id: endHandleId, position: endHandlePosition },
    ]
    const baseWarningPoint =
        allPoints[Math.floor(allPoints.length / 2)] ?? sourcePoint
    const warningPoint = {
        x: baseWarningPoint.x - 25,
        y: baseWarningPoint.y,
    }

    return (
        <>
            <RegulatoryEdgeMarker
                markerId={markerId}
                markerStyle={regulatoryStyle}
                color={edgeColor}
            />
            <path
                d={path}
                fill="none"
                stroke="transparent"
                strokeWidth={REGULATORY_EDGE_HITBOX_WIDTH}
                pointerEvents="stroke"
                className="cursor-pointer"
            />
            <BaseEdge
                id={id}
                className="react-flow__edge-path"
                path={path}
                markerStart={markerStart}
                markerEnd={`url(#${markerId})`}
                interactionWidth={REGULATORY_EDGE_INTERACTION_WIDTH}
                style={{
                    ...style,
                    stroke: edgeColor,
                    strokeWidth: REGULATORY_EDGE_STROKE_WIDTH,
                }}
            />
            {hasInvalidLevels && (
                <>
                    <circle
                        cx={warningPoint.x}
                        cy={warningPoint.y}
                        r={8}
                        fill="#ef4444"
                        stroke="#ffffff"
                        strokeWidth={1.5}
                    />
                    <text
                        x={warningPoint.x}
                        y={warningPoint.y + 3}
                        textAnchor="middle"
                        fontSize="10"
                        fontWeight="700"
                        fill="#ffffff"
                        pointerEvents="none"
                    >
                        !
                    </text>
                </>
            )}
            {isSelected &&
                editableControlPoints.map((point, index) => (
                    <ControlPointHandle
                        key={point.id}
                        id={point.id ?? `${index}`}
                        index={index}
                        x={point.x}
                        y={point.y}
                        color={edgeColor}
                        active={point.active}
                        selected={isSelected}
                        setControlPoints={setControlPoints}
                        selectEdge={selectEdge}
                    />
                ))}
            {isSelected &&
                anchors.map(({ id: anchorId, position }) => (
                    <AnchorHandle
                        key={anchorId}
                        id={anchorId}
                        x={position.x}
                        y={position.y}
                        color={edgeColor}
                        selected={isSelected}
                        onChange={(next) => setAnchorHint(anchorId, next)}
                        selectEdge={selectEdge}
                    />
                ))}
        </>
    )
}

function determineRegulatoryEdgeStyle(
    edgeData: EditableRegulatoryEdge
): RegulatoryEdgeStyle {
    if (
        edgeData.levels.every(
            (level) => level.type === InteractionType.Activation
        )
    ) {
        return REGULATORY_EDGE_STYLES.activation
    }

    if (
        edgeData.levels.every(
            (level) => level.type === InteractionType.Inhibition
        )
    ) {
        return REGULATORY_EDGE_STYLES.inhibition
    }

    return REGULATORY_EDGE_STYLES.dual
}
