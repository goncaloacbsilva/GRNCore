import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import { useEditorStore } from '@/store'
import { useShallow } from 'zustand/react/shallow'
import { twJoin } from 'tailwind-merge'
import { InteractionLabel } from '@/components/shared'

export function InteractionSwitch() {
    const connectModeEnabled = useEditorStore(
        (state) => state.connectModeEnabled
    )

    const { interaction, setInteraction } = useEditorStore(
        useShallow((state) => ({
            interaction: state.connectModeInteraction,
            setInteraction: state.setConnectModeInteraction,
        }))
    )

    return (
        <ButtonGroup
            className={twJoin(
                'transition-all',
                connectModeEnabled ? 'opacity-100' : 'opacity-0'
            )}
        >
            <Button
                variant="outline"
                onClick={() => setInteraction('activation')}
            >
                <InteractionLabel
                    type="activation"
                    selectedType={interaction}
                />
            </Button>
            <Button
                variant="outline"
                onClick={() => setInteraction('inhibition')}
            >
                <InteractionLabel
                    type="inhibition"
                    selectedType={interaction}
                />
            </Button>
        </ButtonGroup>
    )
}
