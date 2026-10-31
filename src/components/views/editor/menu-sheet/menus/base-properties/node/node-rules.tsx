import { Button } from '@/components/ui/button'
import { isRegulatoryRuleExpressionValid } from '@/lib/regulatory-rules'
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip'
import {
    type EditableRegulatoryEdge,
    normalizeRegulatoryNodeProperties,
    type RegulatoryNodeProperties,
    type RegulatoryNodeRule,
} from '@/lib/schema'
import {
    useStore as useReactFlowStore,
    useReactFlow,
    type Edge,
    type Node,
} from '@xyflow/react'
import { AlertCircleIcon, Plus } from 'lucide-react'
import { nanoid } from 'nanoid'
import { useEffect, useRef, useState } from 'react'
import { NodeRule } from './node-rule'
import { compactRuleExpression } from './node-rules-summary-utils'
import { useEditorStore } from '@/store'

interface NodeRulesProps {
    node: Node<RegulatoryNodeProperties>
    incomingNodes: Node<RegulatoryNodeProperties>[]
    incomingEdges: Edge<EditableRegulatoryEdge>[]
    variableSuggestions: string[]
    variableActivityLevels: Record<string, number>
}

export function NodeRules({
    node,
    incomingNodes,
    incomingEdges,
    variableSuggestions,
    variableActivityLevels,
}: NodeRulesProps) {
    const { updateNode } = useReactFlow<Node<RegulatoryNodeProperties>>()
    const bumpSemanticRevision = useEditorStore(
        (state) => state.bumpSemanticRevision
    )
    const currentNodeData = useReactFlowStore(
        (state) => state.nodeLookup.get(node.id)?.data ?? node.data
    )
    const nodeData = normalizeRegulatoryNodeProperties(currentNodeData)
    const scrollContainerRef = useRef<HTMLDivElement | null>(null)
    const previousRulesLengthRef = useRef(nodeData.rules.length)
    const [activeRuleId, setActiveRuleId] = useState<string | null>(null)

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
                    incomingNodes,
                    incomingEdges
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
    }, [incomingEdges, incomingNodes, node.id, nodeData.rules, updateNode])

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
                    normalizeRegulatoryNodeProperties(currentNode.data).rules
                ),
            },
        }))
        bumpSemanticRevision()
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
        setActiveRuleId(newRule.id)
    }

    return (
        <div className="flex min-h-0 flex-col gap-4">
            <AddNodeRuleButton
                onClick={addNodeRule}
                disabled={disableAddRule}
            />
            {nodeData.rules.length > 0 && (
                <div
                    ref={scrollContainerRef}
                    className="max-h-96 min-h-0 overflow-y-auto rounded-md border"
                >
                    {nodeData.rules.map((rule, index) =>
                        rule.id === activeRuleId ? (
                            <NodeRule
                                key={rule.id}
                                ruleKey={index}
                                ruleCount={nodeData.rules.length}
                                rule={rule}
                                node={{ ...node, data: nodeData }}
                                incomingNodes={incomingNodes}
                                incomingEdges={incomingEdges}
                                variableSuggestions={variableSuggestions}
                                variableActivityLevels={variableActivityLevels}
                                updateCallback={updateNodeRule}
                                removeCallback={removeNodeRule}
                            />
                        ) : (
                            <RulePreview
                                key={rule.id}
                                rule={rule}
                                onClick={() => setActiveRuleId(rule.id)}
                            />
                        )
                    )}
                </div>
            )}
        </div>
    )
}

function RulePreview({
    rule,
    onClick,
}: {
    rule: RegulatoryNodeRule
    onClick: () => void
}) {
    return (
        <button
            type="button"
            className="flex min-w-0 w-full items-center gap-2 border-b px-3 py-2 text-left text-xs last:border-b-0 hover:bg-accent/50 focus-visible:bg-accent/50"
            onClick={onClick}
            aria-label={`Edit rule targeting level ${rule.target}`}
            title="Click to edit this expression"
        >
            <span className="shrink-0 text-muted-foreground">
                Level {rule.target}
            </span>
            <span className="min-w-0 flex-1 truncate font-mono text-foreground/80">
                {compactRuleExpression(rule.expression)}
            </span>
            {!rule.isValid && (
                <AlertCircleIcon
                    aria-label="Invalid expression"
                    className="size-3.5 shrink-0 text-destructive"
                />
            )}
        </button>
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
