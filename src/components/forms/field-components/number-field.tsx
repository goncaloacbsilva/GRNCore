import { NumberInput } from '@/components/ui/number-input.tsx'
import { useFieldContext } from '../form-context.ts'
import {
    Field,
    FieldDescription,
    FieldError,
    FieldLabel,
} from '@/components/ui/field'

interface NumberFieldProps {
    label: string
    placeholder: string
    description?: string
    max?: number
    min?: number
    inputClassName?: string
    stackedLabel?: boolean
    decrementTooltip?: React.ReactElement
    incrementTooltip?: React.ReactElement
}

export function NumberField({
    label,
    placeholder,
    description,
    max,
    min,
    inputClassName,
    stackedLabel = false,
    decrementTooltip,
    incrementTooltip,
}: NumberFieldProps) {
    const field = useFieldContext<number>()

    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
    const labelId = `${field.name}-label`

    return (
        <Field data-invalid={isInvalid}>
            <div
                className={
                    stackedLabel
                        ? 'flex w-full flex-col gap-2'
                        : 'flex flex-row justify-between gap-3'
                }
            >
                <FieldLabel
                    id={labelId}
                    className={
                        stackedLabel
                            ? 'w-full whitespace-nowrap'
                            : 'w-fit whitespace-nowrap'
                    }
                    htmlFor={field.name}
                >
                    {label}
                </FieldLabel>
                <NumberInput
                    className={inputClassName ?? 'w-44'}
                    inputClassName="text-left"
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(value: number) =>
                        field.setValue(value ?? min ?? 0)
                    }
                    aria-labelledby={labelId}
                    invalid={isInvalid}
                    placeholder={placeholder}
                    maxValue={max}
                    minValue={min}
                    decrementTooltip={decrementTooltip}
                    incrementTooltip={incrementTooltip}
                />
            </div>
            {description && <FieldDescription>{description}</FieldDescription>}
            {isInvalid && <FieldError errors={field.state.meta.errors} />}
        </Field>
    )
}
