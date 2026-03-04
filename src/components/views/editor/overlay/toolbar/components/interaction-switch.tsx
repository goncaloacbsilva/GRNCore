import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import { useEditorStore } from '@/store'
import { useShallow } from 'zustand/react/shallow'
import { twJoin } from 'tailwind-merge'
import { InteractionType } from '@/lib/schema'

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
                <span
                    className={twJoin(
                        'border-b-2 transition-all',
                        interaction == InteractionType.Activation
                            ? 'border-[#00c800dd]'
                            : 'text-[#000000aa] hover:text-black'
                    )}
                >
                    Positive
                </span>
            </Button>
            <Button
                variant="outline"
                onClick={() => setInteraction('inhibition')}
            >
                <span
                    className={twJoin(
                        'border-b-2 transition-all',
                        interaction == InteractionType.Inhibition
                            ? 'border-[#e80606bd]'
                            : 'text-[#000000aa] hover:text-black'
                    )}
                >
                    Negative
                </span>
            </Button>
        </ButtonGroup>
    )
}
