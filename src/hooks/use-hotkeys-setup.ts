import { useHotkeys } from 'react-hotkeys-hook'
import { useElementsActions } from './use-elements-actions'

export function useHotkeysSetup() {
    const { copyAction, pasteAction, duplicateAction } = useElementsActions()

    // Shortcuts are defined here

    useHotkeys('ctrl+d', () => duplicateAction(), {
        preventDefault: true,
    })

    useHotkeys('ctrl+c', () => copyAction(), {
        preventDefault: true,
    })

    useHotkeys('ctrl+v', () => pasteAction(), {
        preventDefault: true,
    })
}
