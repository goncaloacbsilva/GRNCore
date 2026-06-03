import { file, write } from 'opfs-tools'
import type { StateStorage } from 'zustand/middleware'
import { usePersistenceStatus } from '@/store'

const HISTORY_SNAPSHOT_FILE_PATH = '/history-snapshot.json'
const MIN_SAVING_FEEDBACK_MS = 800
const DEFAULT_PERSISTED_STATE = JSON.stringify({ state: {}, version: 0 })

const isOPFSAvailable = () =>
    typeof navigator !== 'undefined' &&
    typeof navigator.storage?.getDirectory === 'function'

let pendingWrites = 0
let savingStartedAt = 0
let finishTimer: ReturnType<typeof setTimeout> | null = null
let hasLoadedPersistedValue = false
let lastPersistedValue: string | null = null

const startSaving = () => {
    pendingWrites += 1
    if (finishTimer) {
        clearTimeout(finishTimer)
        finishTimer = null
    }
    if (pendingWrites === 1) {
        savingStartedAt = Date.now()
    }
    usePersistenceStatus.getState().setSaving(true)
}

const finishSaving = () => {
    pendingWrites = Math.max(0, pendingWrites - 1)
    if (pendingWrites !== 0) {
        return
    }

    const elapsed = Date.now() - savingStartedAt
    const remaining = Math.max(0, MIN_SAVING_FEEDBACK_MS - elapsed)

    if (remaining === 0) {
        usePersistenceStatus.getState().setSaving(false)
        return
    }

    finishTimer = setTimeout(() => {
        finishTimer = null
        if (pendingWrites === 0) {
            usePersistenceStatus.getState().setSaving(false)
        }
    }, remaining)
}

export const opfsStateStorage: StateStorage = {
    getItem: async () => {
        if (!isOPFSAvailable()) {
            return null
        }

        try {
            const snapshotFile = file(HISTORY_SNAPSHOT_FILE_PATH)
            const exists = await snapshotFile.exists()
            if (!exists) {
                await write(HISTORY_SNAPSHOT_FILE_PATH, DEFAULT_PERSISTED_STATE)
                hasLoadedPersistedValue = true
                lastPersistedValue = DEFAULT_PERSISTED_STATE
                return DEFAULT_PERSISTED_STATE
            }

            const value = await file(HISTORY_SNAPSHOT_FILE_PATH).text()
            hasLoadedPersistedValue = true
            lastPersistedValue = value
            return value
        } catch {
            try {
                await write(HISTORY_SNAPSHOT_FILE_PATH, DEFAULT_PERSISTED_STATE)
                hasLoadedPersistedValue = true
                lastPersistedValue = DEFAULT_PERSISTED_STATE
                return DEFAULT_PERSISTED_STATE
            } catch {
                hasLoadedPersistedValue = true
                lastPersistedValue = null
                return null
            }
        }
    },
    setItem: async (_, value) => {
        if (!isOPFSAvailable()) {
            return
        }
        if (hasLoadedPersistedValue && lastPersistedValue === value) {
            return
        }

        startSaving()
        try {
            await write(HISTORY_SNAPSHOT_FILE_PATH, value)
            hasLoadedPersistedValue = true
            lastPersistedValue = value
        } finally {
            finishSaving()
        }
    },
    removeItem: async () => {
        if (!isOPFSAvailable()) {
            return
        }

        try {
            await file(HISTORY_SNAPSHOT_FILE_PATH).remove()
            hasLoadedPersistedValue = true
            lastPersistedValue = null
        } catch {
            // Ignore when the snapshot does not exist.
        }
    },
}
