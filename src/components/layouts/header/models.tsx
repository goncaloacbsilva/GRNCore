import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbList,
} from '@/components/ui/breadcrumb'
import { useCommunityModelsStatus } from '@/store'
import { ModelsFilters } from './models-filters'
import { useLocation, useMatches } from '@tanstack/react-router'

interface ModelsRouteStaticData {
    getTitle?: () => string
}

export function ModelsHeader() {
    const matches = useMatches()
    const { pathname } = useLocation()
    const isRefreshingCommunityModels = useCommunityModelsStatus(
        (state) => state.isRefreshing
    )
    const shouldShowModelsFilters =
        pathname === '/models/local' || pathname === '/models/community'
    const shouldShowCommunityRefreshIndicator =
        pathname === '/models/community' && isRefreshingCommunityModels

    return (
        <div className="flex w-full items-center justify-between gap-4">
            <div className="flex items-center gap-2">
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
                                <BreadcrumbItem
                                    key={m.id}
                                    className="text-primary"
                                >
                                    {(
                                        m.staticData as ModelsRouteStaticData
                                    ).getTitle?.()}
                                </BreadcrumbItem>
                            ))}
                    </BreadcrumbList>
                </Breadcrumb>
                {shouldShowCommunityRefreshIndicator ? (
                    <span className="size-3.5 shrink-0 rounded-full border-2 border-blue-200 border-t-blue-500 animate-spin" />
                ) : null}
            </div>
            {shouldShowModelsFilters ? <ModelsFilters /> : null}
        </div>
    )
}
