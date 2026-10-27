import { memo, useLayoutEffect, useMemo, useState, type ReactNode } from 'react'
import { type Edge, useStore, useStoreApi } from '@xyflow/react'
import { shallow } from 'zustand/shallow'
import type { EditableRegulatoryEdge } from '@/lib/schema'
import { getParallelEdgeMetadata } from './utils'
import {
    createEdgeRenderMetadataStore,
    EdgeRenderMetadataContext,
    type EdgeRenderMetadataStore,
} from './edge-render-metadata'
import { useEditorTransientStore } from '@/store'

type NodeGeometry = (string | number | undefined)[]
type ReactFlowStoreApi = ReturnType<typeof useStoreApi>

interface MetadataUpdaterProps {
    edges: Edge<EditableRegulatoryEdge>[]
    isDragging: boolean
    metadataStore: EdgeRenderMetadataStore
    nodeGeometry: NodeGeometry
    storeApi: ReactFlowStoreApi
}

const haveSameMetadataInputs = (
    previous: Edge<EditableRegulatoryEdge>[],
    next: Edge<EditableRegulatoryEdge>[]
) =>
    previous.length === next.length &&
    previous.every((edge, index) => {
        const nextEdge = next[index]
        return (
            edge.id === nextEdge?.id &&
            edge.source === nextEdge.source &&
            edge.target === nextEdge.target &&
            edge.data?.points === nextEdge.data?.points
        )
    })

const EdgeMetadataUpdater = memo(
    function EdgeMetadataUpdater({
        edges,
        metadataStore,
        nodeGeometry,
        storeApi,
    }: MetadataUpdaterProps) {
        const parallelEdgeMetadata = useMemo(() => {
            // nodeGeometry is the selection-insensitive subscription token for
            // the mutable node lookup read below.
            void nodeGeometry
            return getParallelEdgeMetadata(
                edges,
                storeApi.getState().nodeLookup
            )
        }, [edges, nodeGeometry, storeApi])

        useLayoutEffect(() => {
            metadataStore.update(parallelEdgeMetadata)
        }, [metadataStore, parallelEdgeMetadata])

        return null
    },
    (previous, next) => {
        if (next.isDragging) return true

        return (
            previous.metadataStore === next.metadataStore &&
            previous.storeApi === next.storeApi &&
            previous.nodeGeometry === next.nodeGeometry &&
            haveSameMetadataInputs(previous.edges, next.edges)
        )
    }
)

export function EdgeRenderMetadataProvider({
    children,
    edges,
}: {
    children: ReactNode
    edges: Edge<EditableRegulatoryEdge>[]
}) {
    const nodeGeometry = useStore((state) => {
        const geometry: NodeGeometry = []
        for (const [nodeId, node] of state.nodeLookup) {
            geometry.push(
                nodeId,
                node.internals.positionAbsolute.x,
                node.internals.positionAbsolute.y,
                node.measured.width,
                node.measured.height
            )
        }
        return geometry
    }, shallow)
    const storeApi = useStoreApi()
    const isDragging = useEditorTransientStore((state) => state.isDragging)
    const [metadataStore] = useState(() =>
        createEdgeRenderMetadataStore(
            getParallelEdgeMetadata(edges, storeApi.getState().nodeLookup)
        )
    )

    return (
        <EdgeRenderMetadataContext.Provider value={metadataStore}>
            <EdgeMetadataUpdater
                edges={edges}
                isDragging={isDragging}
                metadataStore={metadataStore}
                nodeGeometry={nodeGeometry}
                storeApi={storeApi}
            />
            {children}
        </EdgeRenderMetadataContext.Provider>
    )
}
