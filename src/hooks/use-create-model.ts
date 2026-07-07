import { useNavigate } from '@tanstack/react-router'
import { createEmptyModelSnapshot, createLocalModel } from '@/lib/persistence'
import { useChangesTracking } from '@/store'

interface UseCreateModelOptions {
    onCreated?: () => void | Promise<void>
}

export function useCreateModel(options: UseCreateModelOptions = {}) {
    const navigate = useNavigate()
    const markAutoDeleteEmptyModel = useChangesTracking(
        (state) => state.markAutoDeleteEmptyModel
    )

    const createModel = async () => {
        const metadata = await createLocalModel(createEmptyModelSnapshot())
        await navigate({
            to: '/edit/$modelId',
            params: { modelId: metadata.id },
        })
        markAutoDeleteEmptyModel(metadata.id)
        await options.onCreated?.()
    }

    return { createModel }
}
