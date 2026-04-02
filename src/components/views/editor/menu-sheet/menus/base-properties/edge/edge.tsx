import { useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { TabsContent } from '@/components/ui/tabs'
import {
    InteractionType,
    type EditableRegulatoryEdge,
    type RegulatoryNodeProperties,
} from '@/lib/schema'
import { useReactFlow, type Edge, type Node } from '@xyflow/react'
import { Plus } from 'lucide-react'
import { nanoid } from 'nanoid'
import { EdgeLevel } from './edge-level'

interface EdgeBasePropertiesMenuProps {
    edge: Edge<EditableRegulatoryEdge>
}

export function EdgeBasePropertiesMenu({ edge }: EdgeBasePropertiesMenuProps) {
    const { getNode, updateEdgeData } =
        useReactFlow<Node<RegulatoryNodeProperties>>()
    const sourceNode = getNode(edge.source)
    const scrollContainerRef = useRef<HTMLDivElement | null>(null)
    const previousLevelsLengthRef = useRef(edge.data?.levels.length ?? 0)

    useEffect(() => {
        const levelsLength = edge.data?.levels.length ?? 0

        if (levelsLength > previousLevelsLengthRef.current) {
            scrollContainerRef.current?.scrollTo({
                top: scrollContainerRef.current.scrollHeight,
                behavior: 'smooth',
            })
        }

        previousLevelsLengthRef.current = levelsLength
    }, [edge.data?.levels.length])

    const updateEdgeLevel = (
        levelId: string,
        level: EditableRegulatoryEdge['levels'][number]
    ) => {
        const levels = edge.data?.levels
        if (!levels) return

        updateEdgeData(edge.id, {
            ...edge.data,
            levels: levels.map((currentLevel) =>
                currentLevel.id === levelId ? level : currentLevel
            ),
        })
    }

    const removeEdgeLevel = (levelId: string) => {
        const levels = edge.data?.levels
        if (!levels) return

        updateEdgeData(edge.id, {
            ...edge.data,
            levels: levels.filter((level) => level.id !== levelId),
        })
    }

    const findNextTarget = () => {
        const levels = edge.data?.levels

        for (let target = 1; ; target++) {
            if (!levels?.some((level) => level.target === target)) {
                return target
            }
        }
    }

    const addEdgeLevel = () => {
        const levels = edge.data?.levels
        if (!levels) return

        const newLevels = [
            ...levels,
            {
                id: nanoid(),
                target: findNextTarget(),
                type: InteractionType.Activation,
            },
        ]

        updateEdgeData(edge.id, {
            ...edge.data,
            levels: newLevels,
        })
    }

    return (
        <TabsContent
            value="base"
            className="px-4 pb-4 flex h-full min-h-0 flex-col gap-4"
        >
            <Button
                variant="default"
                size="sm"
                className="hover:cursor-pointer w-full"
                onClick={addEdgeLevel}
                disabled={
                    (edge.data?.levels.length ?? 0) + 1 >
                    (sourceNode?.data.activityLevels ?? 0)
                }
            >
                <Plus />
                Add level
            </Button>
            <div
                ref={scrollContainerRef}
                className="min-h-0 flex-1 overflow-y-auto rounded-md border"
            >
                {edge.data?.levels.map((level, index) => (
                    <EdgeLevel
                        key={level.id}
                        removeCallback={removeEdgeLevel}
                        updateCallback={updateEdgeLevel}
                        sourceNode={sourceNode}
                        levelKey={index}
                        level={level}
                        edge={edge}
                    />
                ))}
            </div>
        </TabsContent>
    )
}
