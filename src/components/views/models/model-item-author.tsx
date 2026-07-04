import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import type { ModelMetadata } from '@/lib/schema'

interface ModelItemAuthorProps {
    item: ModelMetadata
}

export function ModelItemAuthor({ item }: ModelItemAuthorProps) {
    return (
        <div className="flex flex-row items-center gap-2">
            <Avatar>
                <AvatarFallback className="font-semibold text-primary">
                    JD
                </AvatarFallback>
            </Avatar>
            <p className="text-sm text-muted-foreground">{item.author}</p>
        </div>
    )
}
