import { Button } from '@/components/ui/button'
import { isRegulatoryRuleExpressionValid } from '@/lib/regulatory-rules'
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip'
import {
    RegulatoryNodePropertiesSchema,
    type RegulatoryNodeProperties,
    type RegulatoryNodeRule,
} from '@/lib/schema'
import { useReactFlow, type Node } from '@xyflow/react'
import { Plus } from 'lucide-react'
import { nanoid } from 'nanoid'
import { useEffect, useRef } from 'react'
import { NodeRule } from './node-rule'
import { Empty, EmptyDescription, EmptyHeader } from '@/components/ui/empty'

interface NodeRulesProps {
    node: Node<RegulatoryNodeProperties>
    incomingNodes: Node<RegulatoryNodeProperties>[]
    variableSuggestions: string[]
    variableActivityLevels: Record<string, number>
}

export function NodeRules({
    node,
    incomingNodes,
    variableSuggestions,
    variableActivityLevels,
}: NodeRulesProps) {
    const { updateNode } = useReactFlow<Node<RegulatoryNodeProperties>>()
    const nodeData = RegulatoryNodePropertiesSchema.parse(node.data)
    const scrollContainerRef = useRef<HTMLDivElement | null>(null)
    const previousRulesLengthRef = useRef(nodeData.rules.length)

    const disableAddRule = nodeData.rules.length + 1 > nodeData.activityLevels

    useEffect(() => {
        const nextRules = nodeData.rules.map((rule) => {
            const hasTargetConflict = nodeData.rules.some(
                (currentRule) =>
                    currentRule.id !== rule.id &&
                    currentRule.target === rule.target
            )
            const isValid =
                !hasTargetConflict &&
                isRegulatoryRuleExpressionValid(
                    rule.expression,
                    incomingNodes
                )

            return rule.isValid === isValid ? rule : { ...rule, isValid }
        })

        const rulesChanged = nextRules.some(
            (rule, index) => rule !== nodeData.rules[index]
        )

        if (!rulesChanged) {
            return
        }

        updateNode(node.id, (currentNode) => ({
            ...currentNode,
            data: {
                ...currentNode.data,
                rules: nextRules,
            },
        }))
    }, [
        node.id,
        nodeData.rules,
        incomingNodes,
        updateNode,
    ])

    useEffect(() => {
        const rulesLength = nodeData.rules.length

        if (rulesLength > previousRulesLengthRef.current) {
            scrollContainerRef.current?.scrollTo({
                top: scrollContainerRef.current.scrollHeight,
                behavior: 'smooth',
            })
        }

        previousRulesLengthRef.current = rulesLength
    }, [nodeData.rules.length])

    const updateNodeRules = (
        updateRules: (rules: RegulatoryNodeRule[]) => RegulatoryNodeRule[]
    ) => {
        updateNode(node.id, (currentNode) => ({
            ...currentNode,
            data: {
                ...currentNode.data,
                rules: updateRules(
                    RegulatoryNodePropertiesSchema.parse(currentNode.data)
                        .rules
                ),
            },
        }))
    }

    const updateNodeRule = (ruleId: string, rule: RegulatoryNodeRule) => {
        updateNodeRules((rules) =>
            rules.map((currentRule) =>
                currentRule.id === ruleId ? rule : currentRule
            )
        )
    }

    const removeNodeRule = (ruleId: string) => {
        updateNodeRules((rules) => rules.filter((rule) => rule.id !== ruleId))
    }

    const findNextTarget = () => {
        for (let target = 1; target <= nodeData.activityLevels; target++) {
            if (!nodeData.rules.some((rule) => rule.target === target)) {
                return target
            }
        }

        return nodeData.activityLevels
    }

    const addNodeRule = () => {
        const newRule: RegulatoryNodeRule = {
            id: nanoid(),
            target: findNextTarget(),
            expression: '',
            isValid: false,
        }
        updateNodeRules((rules) => [...rules, newRule])
    }

    return (
        <div className="flex h-full min-h-0 flex-col gap-4">
            <AddNodeRuleButton
                onClick={addNodeRule}
                disabled={disableAddRule}
            />
            <div
                ref={scrollContainerRef}
                className="min-h-0 flex-1 overflow-y-auto rounded-md border"
            >
                {nodeData.rules.length > 0 ? (
                    nodeData.rules.map((rule, index) => (
                        <NodeRule
                            key={rule.id}
                            ruleKey={index}
                            rule={rule}
                            node={{ ...node, data: nodeData }}
                            incomingNodes={incomingNodes}
                            variableSuggestions={variableSuggestions}
                            variableActivityLevels={variableActivityLevels}
                            updateCallback={updateNodeRule}
                            removeCallback={removeNodeRule}
                        />
                    ))
                ) : (
                    <Empty>
                        <EmptyHeader className="w-54">
                            <EmptyDescription className="text-xs">
                                No rules have been added <br />
                                Target level will be equal to{' '}
                                {nodeData.activityLevels}
                            </EmptyDescription>
                        </EmptyHeader>
                    </Empty>
                )}
            </div>
        </div>
    )
}

function AddNodeRuleButton({
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
                Add logical expression
            </Button>
        </span>
    )

    return (
        <Tooltip>
            {disabled ? <TooltipTrigger asChild>{btn}</TooltipTrigger> : btn}
            <TooltipContent side="bottom">
                <p>
                    Node logical expressions are limited by the node activity
                    levels
                </p>
            </TooltipContent>
        </Tooltip>
    )
}
