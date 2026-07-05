'use client'

import { useEffect, useRef, useState } from 'react'
import {
    Item,
    ItemContent,
    ItemDescription,
    ItemTitle,
} from '@/components/ui/item'
import { Button } from '@/components/ui/button'
import type { ModelMetadata } from '@/lib/schema'
import { twJoin } from 'tailwind-merge'
import { ModelItemMenu } from './model-item-menu'
import { ModelItemAuthor } from './model-item-author'
import { ModelItemTags } from './model-item-tags'

export interface ModelItemProps {
    item: ModelMetadata
    onDelete: (modelId: string) => Promise<void> | void
    onEdit: (item: ModelMetadata) => Promise<void> | void
}

export function ModelItem({ item, onDelete, onEdit }: ModelItemProps) {
    const [isExpanded, setIsExpanded] = useState(false)
    const [hasOverflow, setHasOverflow] = useState(false)
    const descriptionRef = useRef<HTMLParagraphElement | null>(null)

    useEffect(() => {
        const description = descriptionRef.current

        if (!description) {
            return
        }

        const updateOverflow = () => {
            setHasOverflow(description.scrollHeight > description.clientHeight)
        }

        updateOverflow()

        const resizeObserver = new ResizeObserver(() => {
            updateOverflow()
        })

        resizeObserver.observe(description)

        return () => {
            resizeObserver.disconnect()
        }
    }, [item.description])

    return (
        <div className="flex w-full flex-col gap-6">
            <Item variant="outline" className="hover:bg-[#f9fafbc9]">
                <ItemContent>
                    <div className="flex flex-row justify-between">
                        <ItemTitle className="font-semibold">
                            {item.title || 'Untitled model'}
                        </ItemTitle>
                        <ModelItemTags item={item} />
                    </div>
                    <ItemDescription
                        ref={descriptionRef}
                        className={twJoin(
                            'mt-2',
                            isExpanded
                                ? 'text-sm text-wrap line-clamp-none'
                                : 'text-sm text-wrap'
                        )}
                    >
                        {item.description || 'No description provided'}
                    </ItemDescription>
                    {hasOverflow || isExpanded ? (
                        <Button
                            variant="link"
                            size="sm"
                            className="h-auto w-fit px-0"
                            onClick={() => setIsExpanded((value) => !value)}
                        >
                            {isExpanded ? 'Read Less' : 'Read More'}
                        </Button>
                    ) : null}
                    <div className="mt-4 flex flex-row justify-between">
                        <ModelItemAuthor item={item} />
                        <ModelItemMenu
                            item={item}
                            onDelete={onDelete}
                            onEdit={onEdit}
                        />
                    </div>
                </ItemContent>
            </Item>
        </div>
    )
}
