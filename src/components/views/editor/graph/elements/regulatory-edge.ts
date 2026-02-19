import type { InteractionType, RegulatoryEdgeProperties } from '@/lib/schema'
import { type Group } from '@antv/g'
import { Quadratic, type BaseEdgeStyleProps, type EdgeData } from '@antv/g6'

const DEFAULT_INTERACTION_TYPE: InteractionType = 'activation'
const INHIBITION_ARROW_SIZE: [number, number] = [2, 14]
const INHIBITION_ARROW_OFFSET = 8
const SELF_LOOP_DIST = 44
const SELF_LOOP_PLACEMENT: Required<BaseEdgeStyleProps>['loopPlacement'] = 'top'

const EDGE_STYLES: Record<InteractionType, Partial<BaseEdgeStyleProps>> = {
    activation: {
        stroke: '#00C800',
        endArrow: true,
        endArrowType: 'vee',
        endArrowSize: 10,
        endArrowFill: '#00C800',
        endArrowStroke: '#00C800',
    },
    inhibition: {
        stroke: '#c80000',
        endArrow: true,
        endArrowType: 'rect',
        endArrowSize: INHIBITION_ARROW_SIZE,
        endArrowOffset: INHIBITION_ARROW_OFFSET,
        endArrowFill: '#c80000',
        endArrowStroke: '#c80000',
    },
    dual: {
        stroke: '#0000c8',
        endArrow: true,
        endArrowType: 'triangleRect',
    },
}

export class RegulatoryEdge extends Quadratic {
    private get edgeData(): EdgeData {
        return this.context.model.getEdgeDatum(this.id)
    }

    override render(
        attributes: Required<BaseEdgeStyleProps> = this.parsedAttributes,
        container: Group = this as unknown as Group
    ): void {
        const edgeProperties = this.edgeData?.data as
            | Partial<RegulatoryEdgeProperties>
            | undefined
        const interactionType = edgeProperties?.type ?? DEFAULT_INTERACTION_TYPE
        const isSelfLoop = this.edgeData?.source === this.edgeData?.target
        const selfLoopStyle = isSelfLoop
            ? {
                  loopDist: SELF_LOOP_DIST,
                  loopPlacement: SELF_LOOP_PLACEMENT,
              }
            : {}

        super.render(
            {
                ...attributes,
                ...EDGE_STYLES[interactionType],
                lineWidth: 2,
                ...selfLoopStyle,
            } as Required<BaseEdgeStyleProps>,
            container
        )
    }
}
