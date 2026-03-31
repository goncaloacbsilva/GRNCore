import * as React from 'react'
import { MinusIcon, PlusIcon } from 'lucide-react'
import {
    Button,
    Group,
    Input,
    NumberField,
    type NumberFieldProps,
} from 'react-aria-components'

import { cn } from '@/lib/utils'

const NumberInput = React.forwardRef<
    HTMLDivElement,
    NumberFieldProps &
        React.RefAttributes<HTMLDivElement> & {
            inputClassName?: string
            placeholder?: string
        }
>(
    (
        {
            className,
            maxValue,
            minValue,
            inputClassName,
            placeholder,
            ...props
        },
        ref
    ) => {
        return (
            <NumberField
                ref={ref}
                className={cn('w-full space-y-2', className)}
                maxValue={maxValue}
                minValue={minValue}
                {...props}
            >
                <Group className="dark:bg-input/30 border-input data-focus-within:ring-[#2f81ed89]/50 data-focus-within:border-[#2f81ed89] data-focus-within:has-aria-invalid:ring-destructive/20 dark:data-focus-within:has-aria-invalid:ring-destructive/40 data-focus-within:has-aria-invalid:border-destructive relative inline-flex h-9 w-full min-w-0 items-center overflow-hidden rounded-md border bg-transparent text-base whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none data-disabled:pointer-events-none data-disabled:cursor-not-allowed data-disabled:opacity-50 data-focus-within:ring-[3px] md:text-sm">
                    <Input
                        className={cn(
                            'selection:bg-primary selection:text-primary-foreground w-full grow px-3 py-2 text-center tabular-nums outline-none',
                            inputClassName
                        )}
                        placeholder={placeholder}
                        autoComplete="off"
                    />
                    <Button
                        slot="decrement"
                        className="border-input bg-background text-muted-foreground hover:bg-accent hover:text-foreground -me-px flex aspect-square h-[inherit] items-center justify-center border text-sm transition-[color,box-shadow] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <MinusIcon className="size-4" />
                        <span className="sr-only">Decrement</span>
                    </Button>
                    <Button
                        slot="increment"
                        className="border-input bg-background text-muted-foreground hover:bg-accent hover:text-foreground -me-px flex aspect-square h-[inherit] items-center justify-center rounded-r-md border text-sm transition-[color,box-shadow] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <PlusIcon className="size-4" />
                        <span className="sr-only">Increment</span>
                    </Button>
                </Group>
            </NumberField>
        )
    }
)

NumberInput.displayName = 'NumberInput'

export { NumberInput }
