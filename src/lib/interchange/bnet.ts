import type { InternalGRNModel } from '@/lib/schema'
import {
    DEFAULT_NODE_HEIGHT,
    NODE_PLACEMENT_OFFSET,
} from '@/components/views/editor/graph/config'
import {
    findNextNodePosition,
    getNodeContentMinWidth,
} from '@/components/views/editor/graph/utils'
import { Interchanger } from './base'
import type { RegulatoryNodeProperties } from '@/lib/schema'
import type { Node } from '@xyflow/react'
import { BNetFormat } from 'biolqm-io-ts'
import {
    createInternalModelFromLogicalModel,
    createLogicalModelFromInternalModel,
    StringStreamProvider,
} from './bio-lqm-utils'

export class BooleanNetworkInterchanger extends Interchanger {
    readonly mimeType = 'text/plain'
    private readonly bnetFormat = new BNetFormat()

    protected async _export(snapshot: InternalGRNModel): Promise<ArrayBuffer> {
        if (this._isMultiLevelModel(snapshot)) {
            return Promise.reject(
                new Error(`BoolNet doesn't support multi-level models.`)
            )
        }

        const outputStreamProvider = new StringStreamProvider()
        const model = createLogicalModelFromInternalModel(snapshot)
        await this.bnetFormat.exportToProvider(model, outputStreamProvider)

        return this.castToArrayBuffer(outputStreamProvider.getString())
    }

    async import(content: ArrayBuffer): Promise<InternalGRNModel> {
        const inputStreamProvider = new StringStreamProvider()
        inputStreamProvider.setString(this.castToString(content))
        const model =
            await this.bnetFormat.loadFromProvider(inputStreamProvider)

        const grnModel = createInternalModelFromLogicalModel(model)

        const nodes: Node<RegulatoryNodeProperties>[] = []

        for (const node of grnModel.nodes) {
            const width = getNodeContentMinWidth(node.data.name)
            const position = findNextNodePosition({
                basePosition: NODE_PLACEMENT_OFFSET,
                width,
                height: DEFAULT_NODE_HEIGHT,
                nodes,
                edges: [],
            })

            nodes.push({
                ...node,
                position,
            })
        }

        return {
            ...grnModel,
            nodes,
        }
    }

    private _isMultiLevelModel(snapshot: InternalGRNModel): boolean {
        for (const node of snapshot.nodes) {
            const { activityLevels, rules } = node.data

            if (activityLevels !== 1) {
                return true
            }

            const nonEmptyRules = rules.filter(
                (rule) => rule.expression.trim().length > 0
            )

            if (nonEmptyRules.some((rule) => rule.target !== 1)) {
                return true
            }
        }

        return false
    }
}
