import { InteractionType } from '@/lib/schema'
import { twJoin } from 'tailwind-merge'

export interface InteractionIndicatorProps {
    type: InteractionType
    selectedType: InteractionType
}

export function InteractionLabel({
    type,
    selectedType,
}: InteractionIndicatorProps) {
    const active = type === selectedType
    const label = type.charAt(0).toUpperCase() + type.slice(1)
    const borderColor =
        type === InteractionType.Activation ? '#00c800dd' : '#e80606bd'

    return (
        <span
            className={twJoin(
                'border-b-2 transition-all text-[#000000aa] hover:text-black',
                active && 'text-black'
            )}
            style={active ? { borderColor } : undefined}
        >
            {label}
        </span>
    )
}
