import type { ModelMetadata } from '@/lib/schema'

export const getModelSearchKeywords = (query: string) =>
    query
        .trim()
        .toLowerCase()
        .split(/\s+/)
        .filter((keyword) => keyword.length > 0)

export const modelMatchesSearchKeywords = (
    item: Pick<ModelMetadata, 'title' | 'description' | 'author'>,
    keywords: string[]
) => {
    if (keywords.length === 0) {
        return true
    }

    const searchableFields = [
        item.title,
        item.description,
        item.author,
    ].map((value) => value.toLowerCase())

    return keywords.every((keyword) =>
        searchableFields.some((field) => field.includes(keyword))
    )
}
