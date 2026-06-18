import { Input } from '@/components/ui/input.tsx'
import { useFieldContext } from '../form-context.ts'
import {
    Field,
    FieldDescription,
    FieldError,
    FieldLabel,
} from '@/components/ui/field'
import { twJoin } from 'tailwind-merge'
import type { ComponentProps } from 'react'

interface TextFieldProps {
    label: string
    placeholder: string
    description?: string
    orientation?: 'horizontal' | 'vertical'
    showLabel?: boolean
    inputClassName?: string
    forceInvalid?: boolean
    forceError?: string
    inputProps?: Omit<
        ComponentProps<typeof Input>,
        'id' | 'name' | 'value' | 'onChange' | 'aria-invalid'
    >
}

export function TextField({
    label,
    placeholder,
    description,
    orientation,
    showLabel = true,
    inputClassName,
    forceInvalid = false,
    forceError,
    inputProps,
}: TextFieldProps) {
    const field = useFieldContext<string>()
    const customOnBlur = inputProps?.onBlur
    const { ...restInputProps } = inputProps ?? {}

    const hasFieldValidationError =
        (field.state.meta.isTouched || field.state.meta.isDirty) &&
        !field.state.meta.isValid
    const isInvalid = forceInvalid || hasFieldValidationError
    const errors =
        forceInvalid && forceError
            ? [{ message: forceError }]
            : field.state.meta.errors

    return (
        <Field data-invalid={isInvalid}>
            <div
                className={twJoin(
                    'flex',
                    orientation == 'vertical'
                        ? 'flex-col gap-2'
                        : 'flex-row justify-between'
                )}
            >
                {showLabel && (
                    <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
                )}
                <Input
                    className={twJoin(
                        'focus-visible:ring-[#2f81ed89]/50 focus-visible:border-[#2f81ed89]',
                        orientation != 'vertical' && 'w-44',
                        inputClassName
                    )}
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={(event) => {
                        field.handleBlur()
                        customOnBlur?.(event)
                    }}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    placeholder={placeholder}
                    autoComplete="off"
                    {...restInputProps}
                />
            </div>
            {description && <FieldDescription>{description}</FieldDescription>}
            {isInvalid && <FieldError errors={errors} />}
        </Field>
    )
}
