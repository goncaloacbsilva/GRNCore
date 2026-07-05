import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbList,
} from '@/components/ui/breadcrumb'
import { useMatches } from '@tanstack/react-router'

interface ModelsRouteStaticData {
    getTitle?: () => string
}

export function ModelsHeader() {
    const matches = useMatches()

    return (
        <div className="flex flex-row items-center justify-center gap-2">
            <Breadcrumb>
                <BreadcrumbList>
                    {matches
                        .filter(
                            (m) =>
                                (
                                    m.staticData as
                                        | ModelsRouteStaticData
                                        | undefined
                                )?.getTitle
                        )
                        .map((m) => (
                            <BreadcrumbItem className="text-primary">
                                {(
                                    m.staticData as ModelsRouteStaticData
                                ).getTitle?.()}
                            </BreadcrumbItem>
                        ))}
                </BreadcrumbList>
            </Breadcrumb>
        </div>
    )
}
