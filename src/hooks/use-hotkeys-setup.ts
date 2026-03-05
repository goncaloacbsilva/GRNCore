import { useHotkeys } from 'react-hotkeys-hook'
import { useElementsActions } from './use-elements-actions'

export function useHotkeysSetup() {
    const { copyAction, pasteAction, duplicateAction } = useElementsActions()

    // Shortcuts are defined here

    useHotkeys('mod+d', () => duplicateAction(), {
        preventDefault: true,
    })

    useHotkeys('mod+c', () => copyAction(), {
        preventDefault: true,
    })

    useHotkeys('mod+v', () => pasteAction(), {
        preventDefault: true,
    })
}
