import { useFieldContext } from '../form-context.ts'
import {
    Field,
    FieldContent,
    FieldDescription,
    FieldError,
    FieldLabel,
    FieldTitle,
} from '@/components/ui/field'
import { Checkbox } from '@/components/ui/checkbox.tsx'
import { ControlledWrapperTooltip } from '@/components/shared/controlled-tooltip.tsx'

interface CheckboxFieldProps {
    label: string
    description?: string
    disabled?: boolean
    disabledTooltip?: React.ReactElement
}

export function CheckboxField({
    label,
    description,
    disabled,
    disabledTooltip,
}: CheckboxFieldProps) {
    const field = useFieldContext<boolean>()

    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

    return (
        <ControlledWrapperTooltip visible={disabled} tooltip={disabledTooltip}>
            <FieldLabel className="has-data-[state=checked]:bg-[#2f81ed]/5 has-data-disabled:cursor-not-allowed has-data-[state=checked]:border-[#2f81ed]">
                <Field data-invalid={isInvalid}>
                    <div className="flex flex-row justify-between">
                        <FieldContent>
                            <FieldTitle
                                className={
                                    disabled ? 'text-muted-foreground' : ''
                                }
                            >
                                {label}
                            </FieldTitle>
                            {description && (
                                <FieldDescription className="text-[12px]">
                                    {description}
                                </FieldDescription>
                            )}
                        </FieldContent>
                        <Checkbox
                            disabled={disabled}
                            className="data-[state=checked]:bg-[#2f81ed] data-[state=checked]:border-[#2f81ed]"
                            onBlur={field.handleBlur}
                            onCheckedChange={(checked) =>
                                field.handleChange(checked === true)
                            }
                            checked={field.state.value}
                            id={field.name}
                        />
                    </div>
                    {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                    )}
                </Field>
            </FieldLabel>
        </ControlledWrapperTooltip>
    )
}
