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
}

export function ModelItem({ item }: ModelItemProps) {
    const [isExpanded, setIsExpanded] = useState(false)

    return (
        <div className="flex w-full flex-col gap-6">
            <Item variant="outline">
                <ItemContent>
                    <ItemTitle className="font-semibold">
                        {item.title}
                    </ItemTitle>
                    <ItemDescription
                        className={twJoin(
                            'mt-2',
                            isExpanded
                                ? 'text-sm text-wrap line-clamp-none'
                                : 'text-sm text-wrap'
                        )}
                    >
                        {item.description}
                    </ItemDescription>
                    <Button
                        variant="link"
                        size="sm"
                        className="h-auto w-fit px-0"
                        onClick={() => setIsExpanded((value) => !value)}
                    >
                        {isExpanded ? 'Read Less' : 'Read More'}
                    </Button>
                    <div className="mt-5 flex flex-row justify-between">
                        <ModelItemAuthor item={item} />
                        <ModelItemMenu item={item} />
                    </div>
                </ItemContent>
            </Item>
        </div>
    )
}
