import { createFormHook } from '@tanstack/react-form'
import { fieldContext, formContext } from './form-context'
import {
    CheckboxField,
    ColorPickerField,
    NumberField,
    RuleEditorField,
    TagsField,
    TextField,
} from './field-components'

export const { useAppForm } = createFormHook({
    fieldContext,
    formContext,
    fieldComponents: {
        TextField,
        NumberField,
        CheckboxField,
        RuleEditorField,
        ColorPickerField,
        TagsField,
    },
    formComponents: {},
})
