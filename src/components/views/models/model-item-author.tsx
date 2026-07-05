import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import type { ModelMetadata } from '@/lib/schema'

interface ModelItemAuthorProps {
    item: ModelMetadata
}

export function ModelItemAuthor({ item }: ModelItemAuthorProps) {
    const authorName = item.author.trim() || 'Local'
    const initials = authorName
        .split(/\s+/)
        .map((part) => part[0]?.toUpperCase() ?? '')
        .join('')
        .slice(0, 2)

    return (
        <div className="flex flex-row items-center gap-2">
            <Avatar>
                <AvatarFallback className="font-semibold text-primary">
                    {initials}
                </AvatarFallback>
            </Avatar>
            <p className="text-sm text-muted-foreground">{authorName}</p>
        </div>
    )
}
