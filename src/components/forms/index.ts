import { createFormHook } from '@tanstack/react-form'
import { fieldContext, formContext } from './form-context'
import { NumberField, TextField } from './field-components'

export const { useAppForm } = createFormHook({
    fieldContext,
    formContext,
    fieldComponents: {
        TextField,
        NumberField,
    },
    formComponents: {},
})
