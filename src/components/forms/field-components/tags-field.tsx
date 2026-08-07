import {
    Combobox,
    ComboboxChip,
    ComboboxChips,
    ComboboxChipsInput,
    ComboboxCollection,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxGroup,
    ComboboxItem,
    ComboboxLabel,
    ComboboxList,
    ComboboxSeparator,
    ComboboxValue,
    useComboboxAnchor,
} from '@/components/ui/combobox'
import {
    Field,
    FieldContent,
    FieldDescription,
    FieldError,
    FieldLabel,
} from '@/components/ui/field'
import {
    isModelMetadataSourceTag,
    normalizeModelMetadataTags,
    type ModelMetadataTag,
} from '@/lib/schema'
import { useEffect, useRef } from 'react'
import { useFieldContext } from '../form-context'

interface TagsFieldProps {
    label: string
    description?: string
    options: {
        value: string
        items: string[]
    }[]
}

type TagGroup = TagsFieldProps['options'][number]

function getNewSourceTag({
    currentValue,
    nextValue,
}: {
    currentValue: string[]
    nextValue: string[]
}) {
    for (let index = nextValue.length - 1; index >= 0; index -= 1) {
        const tag = nextValue[index]

        if (
            tag &&
            isModelMetadataSourceTag(tag) &&
            !currentValue.includes(tag)
        ) {
            return tag
        }
    }

    return undefined
}

export function TagsField({
    label,
    description = 'Select one or more metadata tags for this model.',
    options,
}: TagsFieldProps) {
    const field = useFieldContext<string[]>()
    const anchor = useComboboxAnchor()
    const container = useRef<HTMLElement | null>(null)
    const isInvalid =
        (field.state.meta.isTouched || field.state.meta.isDirty) &&
        !field.state.meta.isValid

    useEffect(() => {
        container.current = anchor.current?.closest(
            '[data-slot="dialog-content"]'
        ) as HTMLElement | null
    }, [anchor])

    return (
        <Field data-invalid={isInvalid}>
            <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
            <FieldContent>
                <Combobox
                    autoHighlight
                    items={options}
                    multiple
                    value={field.state.value}
                    onValueChange={(value) =>
                        field.handleChange(
                            normalizeModelMetadataTags(
                                value as ModelMetadataTag[],
                                {
                                    preferredSourceTag: getNewSourceTag({
                                        currentValue: field.state.value,
                                        nextValue: value,
                                    }),
                                }
                            )
                        )
                    }
                >
                    <ComboboxChips
                        ref={anchor}
                        aria-invalid={isInvalid}
                        className="w-full"
                    >
                        <ComboboxValue>
                            {(values) => (
                                <>
                                    {(values as string[]).map((item) => (
                                        <ComboboxChip key={item}>
                                            {item}
                                        </ComboboxChip>
                                    ))}
                                    <ComboboxChipsInput
                                        id={field.name}
                                        placeholder="Add tag"
                                        onBlur={field.handleBlur}
                                    />
                                </>
                            )}
                        </ComboboxValue>
                    </ComboboxChips>
                    <ComboboxContent anchor={anchor} container={container}>
                        <ComboboxEmpty>No tags found.</ComboboxEmpty>
                        <ComboboxList>
                            {(group: TagGroup, index: number) => (
                                <ComboboxGroup
                                    key={group.value}
                                    items={group.items}
                                >
                                    <ComboboxLabel>{group.value}</ComboboxLabel>
                                    <ComboboxCollection>
                                        {(item: string) => (
                                            <ComboboxItem
                                                key={item}
                                                value={item}
                                            >
                                                {item}
                                            </ComboboxItem>
                                        )}
                                    </ComboboxCollection>
                                    {index < options.length - 1 && (
                                        <ComboboxSeparator />
                                    )}
                                </ComboboxGroup>
                            )}
                        </ComboboxList>
                    </ComboboxContent>
                </Combobox>
                {description ? (
                    <FieldDescription>{description}</FieldDescription>
                ) : null}
                {isInvalid ? (
                    <FieldError errors={field.state.meta.errors} />
                ) : null}
            </FieldContent>
        </Field>
    )
}
