import { useRef } from 'react'
import {
    BaseEdge,
    type Edge,
    type EdgeProps,
    useInternalNode,
    useReactFlow,
    useStore,
} from '@xyflow/react'
import type { EditableRegulatoryEdge, InteractionType } from '@/lib/schema'
import { DEFAULT_ALGORITHM, type ControlPoint } from '@/lib/types'
import {
    useStableControlPointIds,
    getEditableControlPoints,
    getEditablePath,
    getParallelEdgeMeta,
    projectToNodePerimeter,
    computeRegulatoryEdgeLayout,
} from '../utils'
import { REGULATORY_EDGE_STYLES } from '../config'
import { RegulatoryEdgeMarker } from './regulatory-edge-marker'
import { AnchorHandle, ControlPointHandle } from './editable-edge-handles'
import {
    useRegulatoryEdgeActions,
    useRegulatoryEdgeSelection,
} from '../utils/use-regulatory-edge-interactions'

const REGULATORY_EDGE_STROKE_WIDTH = 1.5

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
    const sourceNode = useInternalNode(source)
    const targetNode = useInternalNode(target)
    const edges = useStore((state) => state.edges)
    const nodeLookup = useStore((state) => state.nodeLookup)
    const userSelectionActive = useStore((state) => state.userSelectionActive)
    const userSelectionRect = useStore((state) => state.userSelectionRect)
    const transform = useStore((state) => state.transform)
    const { setEdges } = useReactFlow()

    if (!sourceNode || !targetNode) {
        return null
    }

    const algorithm = data?.algorithm ?? DEFAULT_ALGORITHM
    const storedPoints = data?.points ?? []
    const { centeredIndex } = getParallelEdgeMeta(edges, id, source, target)

    const isSelected = Boolean(selected)
    const interactionType: InteractionType =
        (data?.type as InteractionType | undefined) ?? 'activation'
    const regulatoryStyle = REGULATORY_EDGE_STYLES[interactionType]
    const {
        startHandleId,
        endHandleId,
        startAnchorHint,
        endAnchorHint,
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

    const latestStoredPointsRef = useRef<ControlPoint[]>(geometryStoredPoints)
    latestStoredPointsRef.current = geometryStoredPoints

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
    const visibleControlPoints = controlPoints.filter(
        (point) => point.id !== startHandleId && point.id !== endHandleId
    )
    const startHandlePosition =
        startAnchorHint ?? projectToNodePerimeter(sourceNode, sourcePoint)
    const endHandlePosition = endAnchorHint ?? targetTipPoint

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

    const showControlPoints = isSelected
    const edgeColor =
        typeof style?.stroke === 'string'
            ? style.stroke
            : (regulatoryStyle.stroke ?? '#b1b1b7')
    const markerId = `${id}-marker-${interactionType}`
    const { selectEdge, setControlPoints, setAnchorHint } =
        useRegulatoryEdgeActions({
            id,
            setEdges,
            startHandleId,
            endHandleId,
            latestStoredPointsRef,
            sourcePoint,
            targetPoint,
            sourceNode,
            targetNode,
        })

    return (
        <>
            <RegulatoryEdgeMarker
                markerId={markerId}
                interactionType={interactionType}
                color={edgeColor}
            />
            <BaseEdge
                id={id}
                className="react-flow__edge-path"
                path={path}
                markerStart={markerStart}
                markerEnd={`url(#${markerId})`}
                style={{
                    ...style,
                    stroke: edgeColor,
                    strokeWidth: REGULATORY_EDGE_STROKE_WIDTH,
                }}
            />
            {showControlPoints &&
                visibleControlPoints.map((point, index) => (
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
            {showControlPoints && (
                <AnchorHandle
                    id={startHandleId}
                    x={startHandlePosition.x}
                    y={startHandlePosition.y}
                    color={edgeColor}
                    selected={isSelected}
                    onChange={(next) => setAnchorHint(startHandleId, next)}
                    selectEdge={selectEdge}
                />
            )}
            {showControlPoints && (
                <AnchorHandle
                    id={endHandleId}
                    x={endHandlePosition.x}
                    y={endHandlePosition.y}
                    color={edgeColor}
                    selected={isSelected}
                    onChange={(next) => setAnchorHint(endHandleId, next)}
                    selectEdge={selectEdge}
                />
            )}
        </>
    )
}
