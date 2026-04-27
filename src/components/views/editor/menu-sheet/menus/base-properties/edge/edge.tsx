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
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip'

interface EdgeBasePropertiesMenuProps {
    edge: Edge<EditableRegulatoryEdge>
}

export function EdgeBasePropertiesMenu({ edge }: EdgeBasePropertiesMenuProps) {
    const { getNode, updateEdgeData } =
        useReactFlow<Node<RegulatoryNodeProperties>>()
    const sourceNode = getNode(edge.source)
    const scrollContainerRef = useRef<HTMLDivElement | null>(null)
    const previousLevelsLengthRef = useRef(edge.data?.levels.length ?? 0)

    const disableAddLevel =
        (edge.data?.levels.length ?? 0) + 1 >
        (sourceNode?.data.activityLevels ?? 0)

    useEffect(() => {
        const maxTargetLevel = sourceNode?.data.activityLevels
        const nextLevels =
            edge.data?.levels.map((level) => {
                const hasConflict =
                    edge.data?.levels.some(
                        (currentLevel) =>
                            currentLevel.id !== level.id &&
                            currentLevel.target === level.target
                    ) ?? false
                const isWithinSourceRange =
                    maxTargetLevel === undefined ||
                    level.target <= maxTargetLevel
                const isValid = !hasConflict && isWithinSourceRange

                return level.isValid === isValid ? level : { ...level, isValid }
            }) ?? []

        const levelsChanged =
            edge.data?.levels.some(
                (level, index) => level !== nextLevels[index]
            ) ?? false

        if (!levelsChanged) {
            return
        }

        updateEdgeData(edge.id, {
            ...edge.data,
            levels: nextLevels,
        })
    }, [edge.data, edge.id, sourceNode?.data.activityLevels, updateEdgeData])

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
                isValid: true,
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
            <AddEdgeLevelButton
                onClick={addEdgeLevel}
                disabled={disableAddLevel}
            />
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

function AddEdgeLevelButton({
    onClick,
    disabled,
}: {
    onClick: () => void
    disabled: boolean
}) {
    const btn = (
        <span className="inline-block w-full">
            <Button
                variant="default"
                size="sm"
                className="hover:cursor-pointer w-full"
                onClick={onClick}
                disabled={disabled}
            >
                <Plus />
                Add level
            </Button>
        </span>
    )

    return (
        <Tooltip>
            {disabled ? <TooltipTrigger asChild>{btn}</TooltipTrigger> : btn}
            <TooltipContent side="bottom">
                <p>
                    Edge interaction levels are limited by the source node
                    activity levels
                </p>
            </TooltipContent>
        </Tooltip>
    )
}
