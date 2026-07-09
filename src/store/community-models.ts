import { create } from 'zustand'

interface CommunityModelsState {
    isRefreshing: boolean
    setRefreshing: (isRefreshing: boolean) => void
}

export const useCommunityModelsStatus = create<CommunityModelsState>((set) => ({
    isRefreshing: false,
    setRefreshing: (isRefreshing) => set({ isRefreshing }),
}))
