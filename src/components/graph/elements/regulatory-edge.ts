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
        stroke: '#4ADE80',
        endArrow: true,
        endArrowType: 'vee',
        endArrowSize: 10,
        endArrowFill: '#4ADE80',
        endArrowStroke: '#4ADE80',
    },
    inhibition: {
        stroke: '#F87171',
        endArrow: true,
        endArrowType: 'rect',
        endArrowSize: INHIBITION_ARROW_SIZE,
        endArrowOffset: INHIBITION_ARROW_OFFSET,
        endArrowFill: '#F87171',
        endArrowStroke: '#F87171',
    },
    dual: {
        stroke: '#a975f3',
        endArrow: false,
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
