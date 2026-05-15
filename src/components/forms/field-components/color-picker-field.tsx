import { Button } from '@/components/ui/button'
import {
    ColorPicker,
    ColorPickerArea,
    ColorPickerContent,
    ColorPickerEyeDropper,
    ColorPickerFormatSelect,
    ColorPickerHueSlider,
    ColorPickerInput,
    ColorPickerSwatch,
    ColorPickerTrigger,
    type ColorPickerProps,
} from '@/components/ui/color-picker'
import {
    Field,
    FieldDescription,
    FieldError,
    FieldLabel,
} from '@/components/ui/field'
import { useFieldContext } from '../form-context'
import { twJoin } from 'tailwind-merge'

interface ColorPickerFieldProps {
    label: string
    description?: string
    defaultValue?: string
    defaultFormat?: ColorPickerProps['defaultFormat']
    disabled?: boolean
    orientation?: 'horizontal' | 'vertical'
}

export function ColorPickerField({
    label,
    description,
    defaultValue = '#000000',
    defaultFormat,
    disabled,
    orientation,
}: ColorPickerFieldProps) {
    const field = useFieldContext<string>()

    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
    const value = field.state.value || defaultValue
    const triggerId = `${field.name}-color-trigger`

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
                <FieldLabel htmlFor={triggerId}>{label}</FieldLabel>
                <ColorPicker
                    value={value}
                    onValueChange={field.handleChange}
                    onOpenChange={(open) => {
                        if (!open) {
                            field.handleBlur()
                        }
                    }}
                    defaultFormat={defaultFormat ?? 'hex'}
                    name={field.name}
                    disabled={disabled}
                >
                    <div
                        className={twJoin(
                            'flex items-center gap-2',
                            orientation != 'vertical' && 'w-44'
                        )}
                    >
                        <ColorPickerTrigger asChild>
                            <Button
                                id={triggerId}
                                type="button"
                                variant="outline"
                                className="flex w-28 items-center justify-start gap-2 px-3"
                                aria-label={`Pick ${label}`}
                                aria-invalid={isInvalid}
                                onBlur={field.handleBlur}
                            >
                                <ColorPickerSwatch className="size-4 shrink-0 rounded-sm" />
                                <span className="min-w-0 truncate text-sm font-normal">
                                    {value}
                                </span>
                            </Button>
                        </ColorPickerTrigger>
                    </div>
                    <ColorPickerContent align="end">
                        <ColorPickerArea />
                        <div className="flex items-center gap-2">
                            <ColorPickerEyeDropper
                                variant="outline"
                                size="icon"
                            />
                            <div className="flex flex-1 flex-col gap-2">
                                <ColorPickerHueSlider />
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <ColorPickerFormatSelect className="w-24" />
                            <ColorPickerInput
                                withoutAlpha
                                className="min-w-0 flex-1"
                                onBlur={field.handleBlur}
                            />
                        </div>
                    </ColorPickerContent>
                </ColorPicker>
            </div>
            {description && <FieldDescription>{description}</FieldDescription>}
            {isInvalid && <FieldError errors={field.state.meta.errors} />}
        </Field>
    )
}
