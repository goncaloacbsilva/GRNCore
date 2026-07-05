import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbList,
} from '@/components/ui/breadcrumb'
import { ModelsFilters } from './models-filters'
import { useLocation, useMatches } from '@tanstack/react-router'

interface ModelsRouteStaticData {
    getTitle?: () => string
}

export function ModelsHeader() {
    const matches = useMatches()
    const { pathname } = useLocation()
    const isLocalModelsRoute = pathname === '/models/local'

    return (
        <div className="flex w-full items-center justify-between gap-4">
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
            {isLocalModelsRoute ? <ModelsFilters /> : null}
        </div>
    )
}
