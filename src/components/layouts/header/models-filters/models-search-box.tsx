import {
    InputGroup,
    InputGroupAddon,
    InputGroupButton,
    InputGroupInput,
    InputGroupText,
} from '@/components/ui/input-group'
import { SearchIcon, XIcon } from 'lucide-react'

interface ModelsSearchBoxProps {
    query: string
    onQueryChange: (query: string) => void
}

export function ModelsSearchBox({
    query,
    onQueryChange,
}: ModelsSearchBoxProps) {
    return (
        <InputGroup className="w-[320px] max-w-[40vw] bg-background has-[[data-slot=input-group-control]:focus-visible]:border-[#2f81ed89] has-[[data-slot=input-group-control]:focus-visible]:ring-[#2f81ed89]/50">
            <InputGroupAddon>
                <InputGroupText>
                    <SearchIcon className="size-4" />
                </InputGroupText>
            </InputGroupAddon>
            <InputGroupInput
                value={query}
                onChange={(event) => onQueryChange(event.target.value)}
                placeholder="Search for model..."
                aria-label="Search models"
            />
            {query ? (
                <InputGroupAddon align="inline-end">
                    <InputGroupButton
                        size="icon-xs"
                        className="rounded-full"
                        onClick={() => onQueryChange('')}
                        aria-label="Clear search"
                    >
                        <XIcon className="size-3.5" />
                    </InputGroupButton>
                </InputGroupAddon>
            ) : null}
        </InputGroup>
    )
}
