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
    getParallelEdgeMeta,
    computeRegulatoryEdgeLayout,
} from '../utils'
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

export function RegulatoryEdge({
    id,
    source,
    target,
    selected,
    markerStart,
    style,
    data,
}: EdgeProps<RegulatoryGraphEdge>) {
    const { setEdges } = useReactFlow()
    const sourceNode = useInternalNode(source)!
    const targetNode = useInternalNode(target)!
    const {
        edges,
        nodeLookup,
        userSelectionActive,
        userSelectionRect,
        transform,
    } = useStore(
        (state) => ({
            edges: state.edges,
            nodeLookup: state.nodeLookup,
            userSelectionActive: state.userSelectionActive,
            userSelectionRect: state.userSelectionRect,
            transform: state.transform,
        }),
        shallow
    )
    const { centeredIndex } = getParallelEdgeMeta(
        edges,
        id,
        source,
        target,
        nodeLookup
    )

    const algorithm = data?.algorithm ?? DEFAULT_ALGORITHM
    const storedPoints = data?.points ?? []
    const isSelected = Boolean(selected)

    const regulatoryStyle = data
        ? determineRegulatoryEdgeStyle(data)
        : REGULATORY_EDGE_STYLES.activation

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
        edges,
        nodeLookup,
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

    useRegulatoryEdgeSelection({
        controlPoints,
        id,
        selected: isSelected,
        setEdges,
        transform,
        userSelectionActive,
        userSelectionRect,
    })

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
    const anchors = [
        { id: startHandleId, position: startHandlePosition },
        { id: endHandleId, position: endHandlePosition },
    ]

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
                onClick={(event) => {
                    event.stopPropagation()
                    selectEdge()
                }}
                onMouseDown={(event) => {
                    event.stopPropagation()
                    selectEdge()
                }}
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
