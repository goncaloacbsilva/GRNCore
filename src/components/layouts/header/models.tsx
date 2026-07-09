import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbList,
} from '@/components/ui/breadcrumb'
import { useCommunityModelsStatus } from '@/store'
import { ModelsFilters } from './models-filters'
import { useLocation } from '@tanstack/react-router'

export function ModelsHeader() {
    const { pathname } = useLocation()
    const isRefreshingCommunityModels = useCommunityModelsStatus(
        (state) => state.isRefreshing
    )
    const shouldShowModelsFilters =
        pathname === '/models/local' || pathname === '/models/community'
    const shouldShowCommunityRefreshIndicator =
        pathname === '/models/community' && isRefreshingCommunityModels
    const breadcrumbTitle =
        pathname === '/models/local'
            ? 'Local Models'
            : pathname === '/models/community'
              ? 'Community Models'
              : null

    return (
        <div className="flex w-full items-center justify-between gap-4">
            <div className="flex items-center gap-2">
                <Breadcrumb>
                    <BreadcrumbList>
                        {breadcrumbTitle ? (
                            <BreadcrumbItem className="text-primary">
                                {breadcrumbTitle}
                            </BreadcrumbItem>
                        ) : null}
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
