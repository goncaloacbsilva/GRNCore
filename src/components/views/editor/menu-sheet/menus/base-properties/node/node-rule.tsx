import { useAppForm } from '@/components/forms'
import {
    isRegulatoryRuleExpressionValid,
    validateRegulatoryRuleExpression,
} from '@/lib/regulatory-rules'
import { Button } from '@/components/ui/button'
import { FieldGroup } from '@/components/ui/field'
import { Separator } from '@/components/ui/separator'
import {
    type EditableRegulatoryEdge,
    RegulatoryNodeRuleSchema,
    type RegulatoryNodeProperties,
    type RegulatoryNodeRule,
} from '@/lib/schema'
import { useEditorStore } from '@/store'
import { useStore } from '@tanstack/react-form'
import { type Edge, type Node } from '@xyflow/react'
import { XIcon } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { Fragment } from 'react/jsx-runtime'

const targetSchema = RegulatoryNodeRuleSchema.shape.target

interface NodeRuleProps {
    ruleKey: number
    ruleCount: number
    rule: RegulatoryNodeRule
    node: Node<RegulatoryNodeProperties>
    incomingNodes: Node<RegulatoryNodeProperties>[]
    incomingEdges: Edge<EditableRegulatoryEdge>[]
    variableSuggestions: string[]
    variableActivityLevels: Record<string, number>
    updateCallback: (ruleId: string, rule: RegulatoryNodeRule) => void
    removeCallback: (ruleId: string) => void
}

export function NodeRule({
    ruleKey,
    ruleCount,
    rule,
    node,
    incomingNodes,
    incomingEdges,
    variableSuggestions,
    variableActivityLevels,
    updateCallback,
    removeCallback,
}: NodeRuleProps) {
    const shouldValidateRef = useRef(false)
    const isRuleFocusedRef = useRef(false)
    const ruleContainerRef = useRef<HTMLDivElement | null>(null)
    const setSnapshotPaused = useEditorStore((state) => state.setSnapshotPaused)

    const form = useAppForm({
        defaultValues: rule,
        validators: {
            onChange: ({ value, formApi }) => {
                if (!shouldValidateRef.current) {
                    return
                }

                const schemaErrors = formApi.parseValuesWithSchema(
                    RegulatoryNodeRuleSchema
                )
                const expressionError = validateRegulatoryRuleExpression(
                    value.expression,
                    incomingNodes,
                    incomingEdges
                )
                const conflict = node.data.rules.some(
                    (currentRule) =>
                        currentRule.id !== rule.id &&
                        currentRule.target === value.target
                )

                return {
                    fields: {
                        ...schemaErrors?.fields,
                        ...(conflict && {
                            target: [
                                ...(schemaErrors?.fields?.target ?? []),
                                {
                                    message: 'Target level value conflict',
                                },
                            ],
                        }),
                        ...(expressionError && {
                            expression: [
                                ...(schemaErrors?.fields?.expression ?? []),
                                { message: expressionError },
                            ],
                        }),
                    },
                }
            },
        },
    })

    const targetValue = useStore(form.store, (state) => state.values.target)
    const formValues = useStore(form.store, (state) => state.values)
    const previousTargetRef = useRef(targetValue)
    const latestFormValuesRef = useRef(formValues)
    const latestNodeRulesRef = useRef(node.data.rules)
    const latestIncomingNodesRef = useRef(incomingNodes)
    const latestIncomingEdgesRef = useRef(incomingEdges)
    const latestRuleRef = useRef(rule)
    const latestUpdateCallbackRef = useRef(updateCallback)
    const hasTargetConflict = node.data.rules.some(
        (currentRule) =>
            currentRule.id !== rule.id && currentRule.target === rule.target
    )

    useEffect(() => {
        latestFormValuesRef.current = formValues
        latestNodeRulesRef.current = node.data.rules
        latestIncomingNodesRef.current = incomingNodes
        latestIncomingEdgesRef.current = incomingEdges
        latestRuleRef.current = rule
        latestUpdateCallbackRef.current = updateCallback
    }, [
        formValues,
        incomingEdges,
        incomingNodes,
        node.data.rules,
        rule,
        updateCallback,
    ])

    const persistRuleValues = () => {
        const values = latestFormValuesRef.current
        const currentRule = latestRuleRef.current

        if (
            values.target === currentRule.target &&
            values.expression === currentRule.expression
        ) {
            return
        }

        const targetParseResult = targetSchema.safeParse(values.target)
        const target = targetParseResult.success
            ? targetParseResult.data
            : currentRule.target
        const hasConflict = latestNodeRulesRef.current.some(
            (nodeRule) =>
                nodeRule.id !== currentRule.id && nodeRule.target === target
        )
        const isExpressionValid = isRegulatoryRuleExpressionValid(
            values.expression,
            latestIncomingNodesRef.current,
            latestIncomingEdgesRef.current
        )

        latestUpdateCallbackRef.current(currentRule.id, {
            ...values,
            target,
            isValid:
                targetParseResult.success && !hasConflict && isExpressionValid,
        })
    }

    useEffect(() => {
        if (isRuleFocusedRef.current) {
            return
        }

        if (
            formValues.target === rule.target &&
            formValues.expression === rule.expression
        ) {
            return
        }

        previousTargetRef.current = rule.target
        form.reset(rule)
    }, [form, formValues.expression, formValues.target, rule])

    useEffect(
        () => () => {
            persistRuleValues()
            setSnapshotPaused(false)
        },
        // This cleanup intentionally uses refs so unmount commits the latest
        // in-progress editor value without resetting on every render.
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []
    )

    useEffect(() => {
        if (rule.expression.trim().length === 0) {
            return
        }

        shouldValidateRef.current = true
        void form.validateField('expression', 'change')
    }, [form, rule.expression])

    useEffect(() => {
        if (!hasTargetConflict && !shouldValidateRef.current) {
            return
        }

        shouldValidateRef.current = true

        if (hasTargetConflict) {
            form.setFieldMeta('target', (prev) => ({
                ...prev,
                isTouched: true,
            }))
        }

        void form.validateField('target', 'change')
    }, [form, hasTargetConflict])

    useEffect(() => {
        if (
            shouldValidateRef.current ||
            (formValues.target === rule.target &&
                formValues.expression === rule.expression)
        ) {
            return
        }

        shouldValidateRef.current = true
        void form.validateAllFields('change')
    }, [form, formValues, rule.expression, rule.target])

    useEffect(() => {
        const targetChanged = previousTargetRef.current !== targetValue
        previousTargetRef.current = targetValue

        if (!targetChanged || !targetSchema.safeParse(targetValue).success) {
            return
        }

        const hasConflict = node.data.rules.some(
            (currentRule) =>
                currentRule.id !== rule.id &&
                currentRule.target === formValues.target
        )

        updateCallback(rule.id, {
            ...formValues,
            isValid:
                !hasConflict &&
                isRegulatoryRuleExpressionValid(
                    formValues.expression,
                    incomingNodes,
                    incomingEdges
                ),
        })
    }, [
        formValues,
        incomingEdges,
        incomingNodes,
        node.data.rules,
        rule.id,
        targetValue,
        updateCallback,
    ])

    useEffect(() => {
        const { expression, target } = formValues

        if (target !== rule.target) {
            return
        }

        const targetParseResult = targetSchema.safeParse(target)
        const hasConflict = node.data.rules.some(
            (currentRule) =>
                currentRule.id !== rule.id && currentRule.target === target
        )
        const isExpressionValid = isRegulatoryRuleExpressionValid(
            expression,
            incomingNodes,
            incomingEdges
        )
        const isValid =
            targetParseResult.success && !hasConflict && isExpressionValid

        if (rule.isValid === isValid) {
            return
        }

        updateCallback(rule.id, {
            ...formValues,
            isValid,
        })
    }, [
        formValues,
        incomingEdges,
        incomingNodes,
        node.data.rules,
        rule,
        updateCallback,
    ])

    const handleFocusCapture = () => {
        isRuleFocusedRef.current = true
        setSnapshotPaused(true)
    }

    const handleBlurCapture = (event: React.FocusEvent<HTMLDivElement>) => {
        if (
            event.relatedTarget instanceof Node &&
            ruleContainerRef.current?.contains(event.relatedTarget)
        ) {
            return
        }

        isRuleFocusedRef.current = false
        setSnapshotPaused(false)
    }

    return (
        <Fragment key={ruleKey}>
            <div
                ref={ruleContainerRef}
                className="group ml-3 flex flex-col p-1"
                onFocusCapture={handleFocusCapture}
                onBlurCapture={handleBlurCapture}
            >
                <div className="flex w-full flex-row justify-end">
                    <Button
                        variant="ghost"
                        size="xs"
                        className="flex flex-row"
                        onClick={() => removeCallback(rule.id)}
                    >
                        <XIcon />
                    </Button>
                </div>
                <FieldGroup className="flex flex-col items-center gap-4 pr-6 pb-2">
                    <form.AppField
                        name="target"
                        children={(field) => (
                            <field.NumberField
                                label="Target Level"
                                placeholder=""
                                inputClassName="w-63"
                                min={targetSchema.minValue ?? undefined}
                                max={node.data.activityLevels}
                            />
                        )}
                    />
                    <form.AppField
                        name="expression"
                        children={(field) => (
                            <field.RuleEditorField
                                label="Logical expression"
                                placeholder="Regulatory logical expression"
                                tooltip={
                                    <div className="flex flex-col">
                                        <strong>
                                            Insert node regulatory expression
                                        </strong>
                                        <span>
                                            For syntax refer to:{' '}
                                            <a
                                                className="hover:underline"
                                                target="_blank"
                                                href="https://colomoto.github.io"
                                            >
                                                https://colomoto.github.io
                                            </a>
                                        </span>
                                    </div>
                                }
                                variableSuggestions={variableSuggestions}
                                variableActivityLevels={variableActivityLevels}
                                onBlur={persistRuleValues}
                            />
                        )}
                    />
                </FieldGroup>
            </div>
            <Separator hidden={ruleKey === ruleCount - 1} className="my-1" />
        </Fragment>
    )
}
