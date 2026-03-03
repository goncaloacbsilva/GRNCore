import { useReactFlow, useStore } from '@xyflow/react'
import { type AnchorHandleProps } from './types'

export function AnchorHandle({
    id,
    x,
    y,
    color,
    selected,
    onChange,
    selectEdge,
}: AnchorHandleProps) {
    const domNode = useStore((state) => state.domNode)
    const { screenToFlowPosition } = useReactFlow()

    return (
        <circle
            tabIndex={0}
            id={id}
            className="nopan nodrag"
            cx={x}
            cy={y}
            r={3}
            strokeOpacity={0.3}
            stroke={color}
            fill="white"
            aria-selected={selected}
            style={{ pointerEvents: 'all' }}
            onPointerDown={(event) => {
                if (event.button === 2) {
                    return
                }
                selectEdge()
                event.preventDefault()
                event.stopPropagation()
                event.nativeEvent.stopImmediatePropagation()

                onChange({ x, y })

                const target = domNode ?? window

                const onPointerMove = (moveEvent: Event) => {
                    if (!(moveEvent instanceof PointerEvent)) {
                        return
                    }
                    moveEvent.preventDefault()

                    onChange(
                        screenToFlowPosition({
                            x: moveEvent.clientX,
                            y: moveEvent.clientY,
                        })
                    )
                }

                const onPointerEnd = (endEvent: Event) => {
                    if (!(endEvent instanceof PointerEvent)) {
                        return
                    }
                    endEvent.preventDefault()
                    target.removeEventListener('pointermove', onPointerMove)
                    target.removeEventListener('pointerup', onPointerEnd)
                    target.removeEventListener('pointerleave', onPointerEnd)

                    onChange(
                        screenToFlowPosition({
                            x: endEvent.clientX,
                            y: endEvent.clientY,
                        })
                    )
                }

                target.addEventListener('pointermove', onPointerMove)
                target.addEventListener('pointerup', onPointerEnd)
                target.addEventListener('pointerleave', onPointerEnd)
            }}
            onKeyDown={(event) => {
                switch (event.key) {
                    case 'Enter':
                    case ' ':
                    case 'Space':
                        selectEdge()
                        onChange({ x, y })
                        break
                    case 'ArrowLeft':
                        onChange({ x: x - 5, y })
                        break
                    case 'ArrowRight':
                        onChange({ x: x + 5, y })
                        break
                    case 'ArrowUp':
                        onChange({ x, y: y - 5 })
                        break
                    case 'ArrowDown':
                        onChange({ x, y: y + 5 })
                        break
                }
            }}
        />
    )
}
