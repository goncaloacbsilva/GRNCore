import { useStore, type Edge, type Node } from '@xyflow/react'
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { shallow } from 'zustand/shallow'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
    EdgeBasePropertiesMenu,
    NodeBasePropertiesMenu,
    StyleMenu,
} from './menus'
import type {
    EditableRegulatoryEdge,
    RegulatoryNodeProperties,
} from '@/lib/schema'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ChevronDownIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useEditorStore } from '@/store/editor'

const SHEET_ANIMATION_DURATION_MS = 200

export function MenuSheet() {
    const { selectedNodes, selectedEdges } = useStore(
        (state) => ({
            selectedNodes: state.nodes.filter(
                (node) => node.selected
            ) as Node<RegulatoryNodeProperties>[],
            selectedEdges: state.edges.filter(
                (edge) => edge.selected
            ) as Edge<EditableRegulatoryEdge>[],
        }),
        shallow
    )
    const isConnectModeEnabled = useEditorStore(
        (state) => state.connectModeEnabled
    )

    const selectedElements = selectedNodes.length + selectedEdges.length
    const [isSheetMounted, setIsSheetMounted] = useState(false)
    const [isSheetVisible, setIsSheetVisible] = useState(false)
    const [renderedSelection, setRenderedSelection] = useState<{
        nodes: Node<RegulatoryNodeProperties>[]
        edges: Edge<EditableRegulatoryEdge>[]
    }>({
        nodes: [],
        edges: [],
    })

    useEffect(() => {
        if (selectedElements > 0) {
            let animationFrame = 0
            const mountTimeout = window.setTimeout(() => {
                setRenderedSelection({
                    nodes: selectedNodes,
                    edges: selectedEdges,
                })
                setIsSheetMounted(true)

                animationFrame = requestAnimationFrame(() => {
                    setIsSheetVisible(true)
                })
            }, 0)

            return () => {
                window.clearTimeout(mountTimeout)
                cancelAnimationFrame(animationFrame)
            }
        }

        const hideTimeout = window.setTimeout(() => {
            setIsSheetVisible(false)
        }, 0)

        const unmountTimeout = window.setTimeout(() => {
            setIsSheetMounted(false)
            setRenderedSelection({
                nodes: [],
                edges: [],
            })
        }, SHEET_ANIMATION_DURATION_MS)

        return () => {
            window.clearTimeout(hideTimeout)
            window.clearTimeout(unmountTimeout)
        }
    }, [selectedEdges, selectedElements, selectedNodes])

    const renderedSelectedElements =
        renderedSelection.nodes.length + renderedSelection.edges.length
    const selectedElementKey =
        renderedSelectedElements === 1
            ? (renderedSelection.nodes[0]?.id ?? renderedSelection.edges[0]?.id)
            : renderedSelectedElements.toString()

    if (!isSheetMounted || renderedSelectedElements === 0) {
        return null
    }

    return (
        <div
            data-element-properties-menu="true"
            className={`pointer-events-none absolute top-6 right-5 z-10 flex max-h-[calc(100vh-13.5rem)] items-start ${isConnectModeEnabled && 'hidden'}`}
        >
            <Collapsible
                key={selectedElementKey}
                defaultOpen
                className={`bg-background flex max-h-10 min-h-0 w-80 flex-col overflow-hidden rounded-lg border transition-all duration-200 ease-out data-[state=open]:max-h-[calc(100vh-13.5rem)] ${
                    isSheetVisible
                        ? 'pointer-events-auto opacity-100'
                        : 'pointer-events-none translate-x-4 opacity-0'
                }`}
            >
                <Tabs
                    className="min-h-0 gap-3"
                    defaultValue="base"
                    value={renderedSelectedElements > 1 ? 'style' : undefined}
                >
                    <div className="flex h-10 shrink-0 items-center justify-between gap-2 overflow-auto border-b p-1">
                        <CollapsibleTrigger className="group flex items-center rounded-sm px-2 py-1 text-sm font-medium hover:bg-accent data-[state=open]:bg-accent">
                            <ChevronDownIcon
                                size={18}
                                className="ml-auto group-data-[state=open]:rotate-180"
                            />
                            <h3 className="pl-2 font-semibold">
                                Element properties
                            </h3>
                        </CollapsibleTrigger>
                    </div>

                    <CollapsibleContent
                        forceMount
                        className="min-h-0 overflow-hidden data-[state=closed]:h-0 data-[state=closed]:grow-0 data-[state=closed]:shrink-0 data-[state=open]:flex data-[state=open]:max-h-[calc(100vh-16rem)] data-[state=open]:flex-col data-[state=open]:overflow-y-auto"
                    >
                        <div className="flex shrink-0 flex-col gap-2 px-4 pb-4">
                            {renderedSelectedElements > 1 && (
                                <Alert>
                                    <AlertDescription className="text-xs">
                                        {renderedSelectedElements} elements
                                        selected
                                    </AlertDescription>
                                </Alert>
                            )}
                            <div className="flex flex-row items-center">
                                {renderedSelectedElements == 1 && (
                                    <TabsList className="w-full">
                                        <>
                                            <TabsTrigger value="base">
                                                Base Properties
                                            </TabsTrigger>
                                            {renderedSelection.nodes.length >
                                                0 && (
                                                <TabsTrigger value="style">
                                                    Style
                                                </TabsTrigger>
                                            )}
                                        </>
                                    </TabsList>
                                )}
                            </div>
                        </div>

                        {/* Menus */}
                        {renderedSelection.nodes.length == 1 && (
                            <>
                                <NodeBasePropertiesMenu
                                    key={`${renderedSelection.nodes[0].id}-base`}
                                    node={renderedSelection.nodes[0]}
                                />
                                <StyleMenu
                                    key={`${renderedSelection.nodes[0].id}-style`}
                                    node={renderedSelection.nodes[0]}
                                />
                            </>
                        )}
                        {renderedSelection.edges.length == 1 && (
                            <EdgeBasePropertiesMenu
                                key={renderedSelection.edges[0].id}
                                edge={renderedSelection.edges[0]}
                            />
                        )}
                    </CollapsibleContent>
                </Tabs>
            </Collapsible>
        </div>
    )
}
