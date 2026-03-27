import { Input } from '@/components/ui/input.tsx'
import { useFieldContext } from '../form-context.ts'
import {
    Field,
    FieldDescription,
    FieldError,
    FieldLabel,
} from '@/components/ui/field'

interface TextFieldProps {
    label: string
    placeholder: string
    description?: string
}

export function TextField({ label, placeholder, description }: TextFieldProps) {
    const field = useFieldContext<string>()

    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

    return (
        <Field data-invalid={isInvalid}>
            <div className="flex flex-row gap-4">
                <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
                <Input
                    className="focus-visible:ring-[#2f81ed89]/50 focus-visible:border-[#2f81ed89]"
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    placeholder={placeholder}
                    autoComplete="off"
                />
            </div>
            {description && <FieldDescription>{description}</FieldDescription>}
            {isInvalid && <FieldError errors={field.state.meta.errors} />}
        </Field>
    )
}
