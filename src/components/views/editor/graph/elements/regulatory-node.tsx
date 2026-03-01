import { useLayoutEffect, useRef } from 'react'
import type { NodeData } from '@antv/g6'
import type { RegulatoryNodeProperties } from '@/lib/schema'
import { twJoin } from 'tailwind-merge'

interface RegulatoryNodeProps {
    data: NodeData
    onResize?: (width: number, height: number) => void
}

export function RegulatoryNode({ data, onResize }: RegulatoryNodeProps) {
    const rootRef = useRef<HTMLDivElement>(null)
    const properties = data.data as RegulatoryNodeProperties

    useLayoutEffect(() => {
        const element = rootRef.current
        if (!element || !onResize) return

        const notify = () => {
            const width = element.offsetWidth
            const height = element.offsetHeight

            if (width > 0 && height > 0) {
                onResize(width, height)
                return
            }

            const rect = element.getBoundingClientRect()
            onResize(Math.ceil(rect.width), Math.ceil(rect.height))
        }

        notify()

        if (typeof ResizeObserver === 'undefined') return

        const observer = new ResizeObserver(() => notify())
        observer.observe(element)
        return () => observer.disconnect()
    }, [onResize, data.id])

    return (
        <div
            ref={rootRef}
            className={twJoin(
                'w-max px-4 py-2 rounded-sm flex flex-col select-none bg-white border-2 border-[#E2E8F0]',
                data.states?.includes('dim') && 'opacity-20'
            )}
            draggable={false}
            onDragStart={(event) => event.preventDefault()}
            style={{
                WebkitUserSelect: 'none',
                WebkitTapHighlightColor: 'transparent',
            }}
        >
            {properties.name ?? data.id}
        </div>
    )
}
