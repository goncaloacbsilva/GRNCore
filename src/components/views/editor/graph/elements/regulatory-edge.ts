import type { RegulatoryEdgeProperties } from '@/lib/schema'
import { Circle, type Group } from '@antv/g'
import {
    Quadratic,
    type BaseEdgeStyleProps,
    type EdgeData,
    type PathArray,
    type Point,
    type QuadraticStyleProps,
} from '@antv/g6'
import {
    DEFAULT_INTERACTION_TYPE,
    REGULATORY_EDGE_STYLES,
} from '../constants/edges'
import {
    ADDITIONAL_CONTROL_POINT_KEY_PREFIX,
    AXIS_ALIGNMENT_TOLERANCE,
} from '../constants'
import {
    getControlPointStyle,
    getNearestControlPoint,
    isAxisAligned,
    toControlPointTuple,
    toControlPointTuples,
    type ControlPointTuple,
} from './regulatory-edge-control-point'
import {
    buildPathFromControlPoints,
    getDefaultControlPoint,
    getSelfLoopControlPoint,
} from './regulatory-edge-path'

/**
 * Custom quadratic edge implementation with support for editable control points,
 * endpoint handles, and self-loop-specific geometry.
 */
export class RegulatoryEdge extends Quadratic {
    private previousAdditionalControlPointCount = 0
    private frameEdgeProperties?: Partial<RegulatoryEdgeProperties>

    /**
     * Returns the latest edge datum from the graph model.
     */
    private get edgeData(): EdgeData | undefined {
        return this.context.model.getEdgeDatum(this.id)
    }

    /**
     * Returns edge properties, preferring frame-local cached data during render.
     */
    private get edgeProperties(): Partial<RegulatoryEdgeProperties> | undefined {
        if (this.frameEdgeProperties) return this.frameEdgeProperties

        return this.edgeData?.data as Partial<RegulatoryEdgeProperties> | undefined
    }

    /**
     * Returns sanitized additional control points.
     */
    private get controlPoints(): ControlPointTuple[] {
        return toControlPointTuples(this.edgeProperties?.controlPoints)
    }

    /**
     * Returns sanitized source endpoint control point, if any.
     */
    private get sourceControlPoint(): ControlPointTuple | undefined {
        return toControlPointTuple(this.edgeProperties?.sourceControlPoint)
    }

    /**
     * Returns sanitized target endpoint control point, if any.
     */
    private get targetControlPoint(): ControlPointTuple | undefined {
        return toControlPointTuple(this.edgeProperties?.targetControlPoint)
    }

    /**
     * Whether this edge is currently selected.
     */
    private get isSelected(): boolean {
        return this.edgeProperties?.selected === true
    }

    /**
     * Computes endpoint guide points used for endpoint snapping/path generation.
     */
    private getEndpointGuidePoints(additionalPoints: ControlPointTuple[]): Point[] {
        const sourceCenter = this.sourceNode.getCenter()
        const targetCenter = this.targetNode.getCenter()
        const isSelfLoop =
            this.edgeData !== undefined &&
            this.edgeData.source === this.edgeData.target

        const getNearestPoint = (
            points: ControlPointTuple[],
            center: Point,
            fallback: Point
        ): Point => {
            if (points.length === 0) return fallback

            let nearest = points[0] as Point
            let nearestDistance = Math.hypot(
                points[0][0] - center[0],
                points[0][1] - center[1]
            )

            for (let index = 1; index < points.length; index += 1) {
                const point = points[index]
                const distance = Math.hypot(
                    point[0] - center[0],
                    point[1] - center[1]
                )

                if (distance < nearestDistance) {
                    nearest = point as Point
                    nearestDistance = distance
                }
            }

            return nearest
        }

        let sourceDefaultGuide: Point
        let targetDefaultGuide: Point

        if (isSelfLoop) {
            const SELF_LOOP_GUIDE_OFFSET = 56
            sourceDefaultGuide = [
                sourceCenter[0] - SELF_LOOP_GUIDE_OFFSET,
                sourceCenter[1] - SELF_LOOP_GUIDE_OFFSET,
            ]
            targetDefaultGuide = [
                sourceCenter[0] + SELF_LOOP_GUIDE_OFFSET,
                sourceCenter[1] - SELF_LOOP_GUIDE_OFFSET,
            ]
        } else {
            sourceDefaultGuide = getNearestPoint(
                additionalPoints,
                sourceCenter,
                targetCenter
            )
            targetDefaultGuide = getNearestPoint(
                additionalPoints,
                targetCenter,
                sourceCenter
            )
        }

        return [
            this.sourceControlPoint ?? sourceDefaultGuide,
            ...(additionalPoints as Point[]),
            this.targetControlPoint ?? targetDefaultGuide,
        ]
    }

    /**
     * Computes source/target endpoints, with special handling for editable self-loops.
     */
    private getComputedEndpoints(
        attributes: Required<BaseEdgeStyleProps>,
        additionalPoints: ControlPointTuple[]
    ): [Point, Point] {
        const isSelfLoop =
            this.edgeData !== undefined &&
            this.edgeData.source === this.edgeData.target
        const hasCustomGeometry =
            additionalPoints.length > 0 ||
            this.sourceControlPoint !== undefined ||
            this.targetControlPoint !== undefined

        if (isSelfLoop && hasCustomGeometry) {
            const guidePoints = this.getEndpointGuidePoints(additionalPoints)
            const sourceGuide = guidePoints[0]
            const targetGuide = guidePoints[guidePoints.length - 1]
            const dx = targetGuide[0] - sourceGuide[0]
            const dy = targetGuide[1] - sourceGuide[1]

            if (
                Number.isFinite(sourceGuide[0]) &&
                Number.isFinite(sourceGuide[1]) &&
                Number.isFinite(targetGuide[0]) &&
                Number.isFinite(targetGuide[1]) &&
                Math.hypot(dx, dy) > 1e-3
            ) {
                return [sourceGuide, targetGuide]
            }
        }

        const guidePoints = this.getEndpointGuidePoints(additionalPoints)
        return this.getEndpoints(attributes, true, guidePoints)
    }

    /**
     * Builds a path that goes through additional control points.
     */
    private getAdditionalControlPointPath(
        sourcePoint: Point,
        targetPoint: Point,
        additionalPoints: ControlPointTuple[]
    ): PathArray {
        const firstControlPoint = getNearestControlPoint(
            sourcePoint,
            additionalPoints
        )
        const lastControlPoint = getNearestControlPoint(
            targetPoint,
            additionalPoints
        )
        const sourceAligned =
            (firstControlPoint &&
                isAxisAligned(
                    sourcePoint,
                    firstControlPoint,
                    AXIS_ALIGNMENT_TOLERANCE
                )) ??
            false
        const targetAligned =
            (lastControlPoint &&
                isAxisAligned(
                    targetPoint,
                    lastControlPoint,
                    AXIS_ALIGNMENT_TOLERANCE
                )) ??
            false

        return buildPathFromControlPoints({
            sourcePoint,
            targetPoint,
            additionalPoints,
            axisAlignmentTolerance: AXIS_ALIGNMENT_TOLERANCE,
            sourceAligned: Boolean(sourceAligned),
            targetAligned: Boolean(targetAligned),
        })
    }

    /**
     * Returns the primary edge path used for rendering and hit-testing.
     */
    protected override getKeyPath(
        attributes: Required<BaseEdgeStyleProps>
    ): PathArray {
        const additionalPoints = this.controlPoints
        const isSelfLoop =
            this.edgeData !== undefined &&
            this.edgeData.source === this.edgeData.target
        const hasCustomGeometry =
            additionalPoints.length > 0 ||
            this.sourceControlPoint !== undefined ||
            this.targetControlPoint !== undefined

        if (isSelfLoop && !hasCustomGeometry) {
            return super.getKeyPath(attributes as Required<QuadraticStyleProps>)
        }

        const [sourcePoint, targetPoint] = this.getComputedEndpoints(
            attributes,
            additionalPoints
        )

        if (additionalPoints.length > 0) {
            return this.getAdditionalControlPointPath(
                sourcePoint,
                targetPoint,
                additionalPoints
            )
        }

        const curveAttributes = attributes as Required<BaseEdgeStyleProps> & {
            curveOffset?: number
            curvePosition?: number
            controlPoint?: Point
        }
        const controlPoint =
            curveAttributes.controlPoint ??
            getDefaultControlPoint(
                sourcePoint,
                targetPoint,
                curveAttributes.curvePosition ?? 0.5,
                curveAttributes.curveOffset ?? 30
            )

        return [
            ['M', sourcePoint[0], sourcePoint[1]],
            [
                'Q',
                controlPoint[0],
                controlPoint[1],
                targetPoint[0],
                targetPoint[1],
            ],
        ]
    }

    /**
     * Returns self-loop path geometry, reusing additional-control-point logic when present.
     */
    protected override getLoopPath(
        attributes: Required<BaseEdgeStyleProps>
    ): PathArray {
        const additionalPoints = this.controlPoints
        const [sourcePoint, targetPoint] = this.getComputedEndpoints(
            attributes,
            additionalPoints
        )

        if (additionalPoints.length > 0) {
            return this.getAdditionalControlPointPath(
                sourcePoint,
                targetPoint,
                additionalPoints
            )
        }

        const controlPoint = getSelfLoopControlPoint(
            sourcePoint,
            targetPoint,
            this.sourceNode.getCenter()
        )

        return [
            ['M', sourcePoint[0], sourcePoint[1]],
            [
                'Q',
                controlPoint[0],
                controlPoint[1],
                targetPoint[0],
                targetPoint[1],
            ],
        ]
    }

    /**
     * Renders the edge with style by interaction type and manages control-point markers.
     */
    override render(
        attributes: Required<BaseEdgeStyleProps> = this.parsedAttributes,
        container: Group = this as unknown as Group
    ): void {
        const edgeData = this.edgeData
        const edgeProperties = edgeData?.data as
            | Partial<RegulatoryEdgeProperties>
            | undefined

        this.frameEdgeProperties = edgeProperties

        const interactionType = edgeProperties?.type ?? DEFAULT_INTERACTION_TYPE

        try {
            super.render(
                {
                    ...attributes,
                    ...(REGULATORY_EDGE_STYLES[
                        interactionType
                    ] as Partial<BaseEdgeStyleProps>),
                    lineWidth: 2,
                } as Required<BaseEdgeStyleProps>,
                container
            )

            const controlPoints = this.controlPoints

            if (this.isSelected) {
                controlPoints.forEach((point, index) => {
                    this.upsert(
                        `${ADDITIONAL_CONTROL_POINT_KEY_PREFIX}${index}`,
                        Circle,
                        getControlPointStyle(point),
                        container
                    )
                })

                for (
                    let index = controlPoints.length;
                    index < this.previousAdditionalControlPointCount;
                    index += 1
                ) {
                    this.upsert(
                        `${ADDITIONAL_CONTROL_POINT_KEY_PREFIX}${index}`,
                        Circle,
                        false,
                        container
                    )
                }

                this.previousAdditionalControlPointCount = controlPoints.length
            } else {
                for (
                    let index = 0;
                    index < this.previousAdditionalControlPointCount;
                    index += 1
                ) {
                    this.upsert(
                        `${ADDITIONAL_CONTROL_POINT_KEY_PREFIX}${index}`,
                        Circle,
                        false,
                        container
                    )
                }

                this.previousAdditionalControlPointCount = 0
            }
        } finally {
            this.frameEdgeProperties = undefined
        }
    }
}
