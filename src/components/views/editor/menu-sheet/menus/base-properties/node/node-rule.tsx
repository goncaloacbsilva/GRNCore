import { useAppForm } from '@/components/forms'
import { Button } from '@/components/ui/button'
import { FieldGroup } from '@/components/ui/field'
import { Item, ItemContent, ItemFooter } from '@/components/ui/item'
import { Separator } from '@/components/ui/separator'
import {
    RegulatoryNodeRuleSchema,
    type RegulatoryNodeProperties,
    type RegulatoryNodeRule,
} from '@/lib/schema'
import { useStore } from '@tanstack/react-form'
import { type Node } from '@xyflow/react'
import { XIcon } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { Fragment } from 'react/jsx-runtime'

const targetSchema = RegulatoryNodeRuleSchema.shape.target

interface NodeRuleProps {
    ruleKey: number
    rule: RegulatoryNodeRule
    node: Node<RegulatoryNodeProperties>
    variableSuggestions: string[]
    variableActivityLevels: Record<string, number>
    updateCallback: (ruleId: string, rule: RegulatoryNodeRule) => void
    removeCallback: (ruleId: string) => void
}

export function NodeRule({
    ruleKey,
    rule,
    node,
    variableSuggestions,
    variableActivityLevels,
    updateCallback,
    removeCallback,
}: NodeRuleProps) {
    const shouldValidateRef = useRef(false)
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
                    },
                }
            },
        },
    })

    const targetValue = useStore(form.store, (state) => state.values.target)
    const expressionValue = useStore(
        form.store,
        (state) => state.values.expression
    )
    const formValues = useStore(form.store, (state) => state.values)
    const isValid = useStore(form.store, (state) => state.isValid)
    const isTouched = useStore(form.store, (state) => state.isTouched)
    const previousTargetRef = useRef(targetValue)
    const previousExpressionRef = useRef(expressionValue)

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

        if (!targetChanged || !isValid) {
            return
        }

        updateCallback(rule.id, formValues)
    }, [formValues, isValid, rule.id, targetValue, updateCallback])

    useEffect(() => {
        const expressionChanged =
            previousExpressionRef.current !== expressionValue
        previousExpressionRef.current = expressionValue

        if (!expressionChanged || !isTouched || !isValid) {
            return
        }

        updateCallback(rule.id, formValues)
    }, [
        expressionValue,
        formValues,
        isTouched,
        isValid,
        rule.id,
        updateCallback,
    ])

    return (
        <Fragment key={ruleKey}>
            <Item variant="default" size="sm" className="group">
                <ItemContent className="flex flex-col items-center gap-2">
                    <FieldGroup className="flex flex-col items-center gap-4">
                        <form.AppField
                            name="target"
                            children={(field) => (
                                <field.NumberField
                                    label="Target Level"
                                    placeholder=""
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
                                                Insert node regulatory
                                                expression
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
                                    variableActivityLevels={
                                        variableActivityLevels
                                    }
                                />
                            )}
                        />
                    </FieldGroup>
                </ItemContent>
                <ItemFooter className="flex flex-col items-center">
                    <Button
                        variant="ghost"
                        size="xs"
                        className="hidden flex-row group-hover:flex"
                        onClick={() => removeCallback(rule.id)}
                    >
                        <XIcon />
                        Remove
                    </Button>
                </ItemFooter>
            </Item>
            <Separator className="my-1" />
        </Fragment>
    )
}
