'use client'

import { useState } from 'react'
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

export interface ModelItemProps {
    item: ModelMetadata
    onDelete: (modelId: string) => Promise<void> | void
    onEdit: (item: ModelMetadata) => Promise<void> | void
}

export function ModelItem({ item, onDelete, onEdit }: ModelItemProps) {
    const [isExpanded, setIsExpanded] = useState(false)

    return (
        <div className="flex w-full flex-col gap-6">
            <Item variant="outline">
                <ItemContent>
                    <ItemTitle className="font-semibold">
                        {item.title || 'Untitled model'}
                    </ItemTitle>
                    <ItemDescription
                        className={twJoin(
                            'mt-2',
                            isExpanded
                                ? 'text-sm text-wrap line-clamp-none'
                                : 'text-sm text-wrap'
                        )}
                    >
                        {item.description || 'No description provided'}
                    </ItemDescription>
                    <Button
                        hidden={item.description?.length < 100}
                        variant="link"
                        size="sm"
                        className="h-auto w-fit px-0"
                        onClick={() => setIsExpanded((value) => !value)}
                    >
                        {isExpanded ? 'Read Less' : 'Read More'}
                    </Button>
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
