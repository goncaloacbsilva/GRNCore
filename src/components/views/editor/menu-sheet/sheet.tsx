import { useStore, type Edge, type Node } from '@xyflow/react'
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet'
import { shallow } from 'zustand/shallow'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { EdgeBasePropertiesMenu, NodeBasePropertiesMenu } from './menus'
import type {
    EditableRegulatoryEdge,
    RegulatoryNodeProperties,
} from '@/lib/schema'
import { Alert, AlertDescription } from '@/components/ui/alert'

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

    const selectedElements = selectedNodes.length + selectedEdges.length

    return (
        <Sheet
            open={selectedNodes.length > 0 || selectedEdges.length > 0}
            modal={false}
        >
            <SheetContent
                showCloseButton={false}
                className="top-12 pb-12 data-[state=closed]:duration-300! data-[state=open]:duration-300! w-80"
            >
                <Tabs
                    className="h-full"
                    defaultValue="base"
                    value={selectedElements > 1 ? 'style' : undefined}
                >
                    <SheetHeader>
                        <SheetTitle className="sr-only">
                            Element properties
                        </SheetTitle>
                        <SheetDescription className="sr-only">
                            Inspect and edit the properties of the selected
                            graph element.
                        </SheetDescription>
                        <div className="flex flex-col gap-2">
                            {selectedElements > 1 && (
                                <Alert>
                                    <AlertDescription className="text-xs">
                                        {selectedElements} elements selected
                                    </AlertDescription>
                                </Alert>
                            )}
                            <div className="flex flex-row items-center">
                                <TabsList className="w-full">
                                    {selectedElements == 1 && (
                                        <TabsTrigger value="base">
                                            Base Properties
                                        </TabsTrigger>
                                    )}

                                    <TabsTrigger value="style">
                                        Style
                                    </TabsTrigger>
                                </TabsList>
                            </div>
                        </div>
                    </SheetHeader>

                    {/* Menus */}
                    {selectedNodes.length > 0 && (
                        <NodeBasePropertiesMenu
                            key={selectedNodes[0].id}
                            node={selectedNodes[0]}
                        />
                    )}
                    {selectedEdges.length > 0 && (
                        <EdgeBasePropertiesMenu
                            key={selectedEdges[0].id}
                            edge={selectedEdges[0]}
                        />
                    )}
                </Tabs>
            </SheetContent>
        </Sheet>
    )
}
