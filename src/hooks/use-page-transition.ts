import anime from 'animejs'
import { useEffect, type RefObject } from 'react'

type TransitionDirection = 'forward' | 'back'

const ROUTE_TRANSITION_SELECTOR = '[data-route-transition-root="true"]'
const EXIT_DISTANCE_PX = 32
const ENTER_DISTANCE_PX = 24
const EXIT_DURATION_MS = 180
const ENTER_DURATION_MS = 260

let pendingDirection: TransitionDirection = 'forward'

const getOffset = (direction: TransitionDirection) =>
    direction === 'forward' ? -EXIT_DISTANCE_PX : EXIT_DISTANCE_PX

const getEnterOffset = (direction: TransitionDirection) =>
    direction === 'forward' ? ENTER_DISTANCE_PX : -ENTER_DISTANCE_PX

const animateCurrentRouteOut = async (direction: TransitionDirection) => {
    if (typeof document === 'undefined') {
        return
    }

    const currentRoute = document.querySelector<HTMLElement>(
        ROUTE_TRANSITION_SELECTOR
    )

    if (!currentRoute) {
        return
    }

    anime.remove(currentRoute)

    await new Promise<void>((resolve) => {
        anime({
            targets: currentRoute,
            opacity: [1, 0],
            translateX: [0, getOffset(direction)],
            filter: ['blur(0px)', 'blur(4px)'],
            duration: EXIT_DURATION_MS,
            easing: 'easeInOutQuad',
            complete: () => resolve(),
        })
    })
}

export function usePageTransitionNavigate() {
    return async (
        direction: TransitionDirection,
        action: () => Promise<void> | void
    ) => {
        pendingDirection = direction
        await animateCurrentRouteOut(direction)
        await action()
    }
}

export function usePageEnterTransition(ref: RefObject<HTMLElement | null>) {
    useEffect(() => {
        const target = ref.current

        if (!target) {
            return
        }

        const direction = pendingDirection
        pendingDirection = 'forward'

        anime.remove(target)
        anime.set(target, {
            opacity: 0,
            translateX: getEnterOffset(direction),
            filter: 'blur(4px)',
        })

        const animation = anime({
            targets: target,
            opacity: [0, 1],
            translateX: [getEnterOffset(direction), 0],
            filter: ['blur(4px)', 'blur(0px)'],
            duration: ENTER_DURATION_MS,
            easing: 'easeOutCubic',
        })

        return () => {
            animation.pause()
            anime.remove(target)
        }
    }, [ref])
}
