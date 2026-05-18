import { useStore, type Edge, type Node } from '@xyflow/react'
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible'
import anime from 'animejs'
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
import { useEffect, useRef, useState } from 'react'
import { useEditorStore } from '@/store/editor'

const SHEET_ANIMATION_DURATION_MS = 200
const SHEET_EXPAND_DURATION_MS = 200
const SHEET_COLLAPSE_DURATION_MS = 200
const SHEET_COLLAPSE_EASING = 'easeOutQuad'

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
    const [isSheetOpen, setIsSheetOpen] = useState(true)
    const [renderedSelection, setRenderedSelection] = useState<{
        nodes: Node<RegulatoryNodeProperties>[]
        edges: Edge<EditableRegulatoryEdge>[]
    }>({
        nodes: [],
        edges: [],
    })
    const animatedContentRef = useRef<HTMLDivElement | null>(null)
    const animatedContentInnerRef = useRef<HTMLDivElement | null>(null)
    const contentAnimationRef = useRef<ReturnType<typeof anime> | null>(null)
    const hasInitializedContentAnimationRef = useRef(false)

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

    useEffect(() => {
        setIsSheetOpen(true)
    }, [selectedElementKey])

    useEffect(() => {
        const content = animatedContentRef.current
        const contentInner = animatedContentInnerRef.current
        if (!content || !contentInner) {
            return
        }

        if (contentAnimationRef.current) {
            contentAnimationRef.current.pause()
            contentAnimationRef.current = null
        }

        const measuredExpandedHeight = contentInner.scrollHeight
        const currentHeight = content.getBoundingClientRect().height

        if (!hasInitializedContentAnimationRef.current) {
            hasInitializedContentAnimationRef.current = true
            content.style.overflow = isSheetOpen ? 'auto' : 'hidden'
            content.style.height = isSheetOpen ? 'auto' : '0px'
            content.style.pointerEvents = isSheetOpen ? 'auto' : 'none'
            return
        }

        content.style.overflow = 'hidden'

        if (isSheetOpen) {
            content.style.pointerEvents = 'auto'
            contentAnimationRef.current = anime({
                targets: content,
                height: [currentHeight, measuredExpandedHeight],
                duration: SHEET_EXPAND_DURATION_MS,
                easing: SHEET_COLLAPSE_EASING,
                complete: () => {
                    content.style.height = 'auto'
                    content.style.overflow = 'auto'
                    content.style.pointerEvents = 'auto'
                },
            })
            return
        }

        contentAnimationRef.current = anime({
            targets: content,
            height: [currentHeight, 0],
            duration: SHEET_COLLAPSE_DURATION_MS,
            easing: SHEET_COLLAPSE_EASING,
            complete: () => {
                content.style.height = '0px'
                content.style.pointerEvents = 'none'
                content.style.overflow = 'hidden'
            },
        })
    }, [isSheetOpen, selectedElementKey])

    useEffect(
        () => () => {
            if (contentAnimationRef.current) {
                contentAnimationRef.current.pause()
                contentAnimationRef.current = null
            }
        },
        []
    )

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
                open={isSheetOpen}
                onOpenChange={setIsSheetOpen}
                className={`group bg-background pointer-events-auto flex max-h-10 min-h-0 w-80 flex-col overflow-hidden rounded-lg border transition-all duration-200 ease-out data-[state=open]:max-h-[calc(100vh-13.5rem)] ${
                    isSheetVisible
                        ? 'opacity-100'
                        : 'pointer-events-none translate-x-4 opacity-0'
                }`}
            >
                <Tabs
                    className="min-h-0 gap-3"
                    defaultValue="base"
                    value={renderedSelectedElements > 1 ? 'style' : undefined}
                >
                    <div
                        className={`flex h-10 shrink-0 items-center justify-between gap-2 overflow-auto p-1 ${
                            isSheetOpen ? 'border-b' : ''
                        }`}
                    >
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
                        className="min-h-0"
                    >
                        <div
                            ref={animatedContentRef}
                            className="h-auto overflow-hidden"
                        >
                            <div
                                ref={animatedContentInnerRef}
                                className="flex min-h-0 max-h-[calc(100vh-16rem)] flex-col overflow-y-auto"
                            >
                                <div className="flex shrink-0 flex-col gap-2 px-4 pb-4">
                                    {renderedSelectedElements > 1 && (
                                        <Alert>
                                            <AlertDescription className="text-xs">
                                                {renderedSelectedElements}{' '}
                                                elements selected
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
                                                    {renderedSelection.nodes
                                                        .length > 0 && (
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
                            </div>
                        </div>
                    </CollapsibleContent>
                </Tabs>
            </Collapsible>
        </div>
    )
}
