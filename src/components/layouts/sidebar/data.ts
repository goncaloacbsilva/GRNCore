import { Dna, HardDrive, UsersRound } from 'lucide-react'
import type { NavigationItem } from './nav-main'

export const NAVIGATION_ITEMS: NavigationItem[] = [
    {
        title: 'Models',
        url: '#',
        icon: Dna,
        isActive: true,
        items: [
            {
                title: 'Local',
                url: '#',
                icon: HardDrive,
            },
            {
                title: 'Community',
                url: '#',
                icon: UsersRound,
            },
        ],
    },
]
