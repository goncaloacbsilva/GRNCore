import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { useEffect } from 'react'

export function EditableModePlugin({ isEditing }: { isEditing: boolean }) {
    const [editor] = useLexicalComposerContext()

    useEffect(() => {
        editor.setEditable(isEditing)
    }, [editor, isEditing])

    return null
}
