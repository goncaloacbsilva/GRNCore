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
    decrementTooltip?: string
}

export function NumberField({
    label,
    placeholder,
    description,
    max,
    min,
    decrementTooltip,
}: NumberFieldProps) {
    const field = useFieldContext<number>()

    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

    return (
        <Field data-invalid={isInvalid}>
            <div className="flex flex-row justify-between gap-4">
                <FieldLabel
                    className="w-fit whitespace-nowrap"
                    htmlFor={field.name}
                >
                    {label}
                </FieldLabel>
                <NumberInput
                    className="w-44"
                    inputClassName="text-left"
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(value: number) =>
                        field.setValue(value ?? min ?? 0)
                    }
                    invalid={isInvalid}
                    placeholder={placeholder}
                    maxValue={max}
                    minValue={min}
                    decrementTooltip={decrementTooltip}
                />
            </div>
            {description && <FieldDescription>{description}</FieldDescription>}
            {isInvalid && <FieldError errors={field.state.meta.errors} />}
        </Field>
    )
}
