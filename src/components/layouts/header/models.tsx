import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
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
                            <BreadcrumbItem>
                                <BreadcrumbLink>
                                    {(
                                        m.staticData as ModelsRouteStaticData
                                    ).getTitle?.()}
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                        ))}
                </BreadcrumbList>
            </Breadcrumb>
        </div>
    )
}
