import { dir, file, write } from 'opfs-tools'
import type {
    InternalGRNModel,
    ModelMetadataDetails,
    ModelMetadata,
    ModelMetadataTag,
    PersistedAnnotations,
} from '@/lib/schema'
import {
    normalizeModelMetadataDetails,
    normalizeModelMetadataTags,
} from '@/lib/schema'
import { InterchangeFormat } from '@/lib/interchange'
import { usePersistenceStatus } from '@/store/persistence'
import type { SerializedEditorState } from 'lexical'
import { createEmptyModelSnapshot } from './model-snapshot'
import {
    loadSnapshotOffMainThread,
    serializeSnapshotOffMainThread,
} from './snapshot-serializer'
import type { SnapshotMutation } from './snapshot-serialization'

const METADATA_FILE_PATH = '/metadata.json'
const SNAPSHOTS_DIRECTORY_PATH = '/snapshots'
const SAVING_FEEDBACK_DELAY_MS = 150

const isOPFSAvailable = () =>
    typeof navigator !== 'undefined' &&
    typeof navigator.storage?.getDirectory === 'function'

let pendingWrites = 0
let savingFeedbackTimer: ReturnType<typeof setTimeout> | null = null
let persistenceWriteQueue = Promise.resolve()

const startSaving = () => {
    pendingWrites += 1
    if (pendingWrites !== 1 || savingFeedbackTimer) {
        return
    }

    savingFeedbackTimer = setTimeout(() => {
        savingFeedbackTimer = null
        if (pendingWrites > 0) {
            usePersistenceStatus.getState().setSaving(true)
        }
    }, SAVING_FEEDBACK_DELAY_MS)
}

const finishSaving = () => {
    pendingWrites = Math.max(0, pendingWrites - 1)
    if (pendingWrites !== 0) {
        return
    }

    if (savingFeedbackTimer) {
        clearTimeout(savingFeedbackTimer)
        savingFeedbackTimer = null
    }
    usePersistenceStatus.getState().setSaving(false)
}

const notifyLocalModelsChanged = () => {
    usePersistenceStatus.getState().bumpLocalModelsVersion()
}

const enqueuePersistenceWrite = async <T>(
    task: () => Promise<T>
): Promise<T> => {
    const queuedTask = persistenceWriteQueue.then(task)

    persistenceWriteQueue = queuedTask.then(
        () => undefined,
        () => undefined
    )

    return queuedTask
}

const snapshotPath = (modelId: string) =>
    `${SNAPSHOTS_DIRECTORY_PATH}/${modelId}.json`

const ensureSnapshotsDirectory = async () => {
    await dir(SNAPSHOTS_DIRECTORY_PATH).create()
}

const parseJson = <T>(value: string, fallback: T): T => {
    try {
        return JSON.parse(value) as T
    } catch {
        return fallback
    }
}

const normalizeMetadataItem = (
    item: Omit<ModelMetadata, 'createdAt' | 'lastChangedAt'> & {
        createdAt?: number
        lastChangedAt?: number
    }
): ModelMetadata => ({
    ...item,
    createdAt: item.createdAt ?? item.lastChangedAt ?? 0,
    lastChangedAt: item.lastChangedAt ?? 0,
})

const sortModelsByLastChangedAt = (items: ModelMetadata[]): ModelMetadata[] =>
    [...items].sort((left, right) => right.lastChangedAt - left.lastChangedAt)

const readMetadataList = async (): Promise<ModelMetadata[]> => {
    if (!isOPFSAvailable()) {
        return []
    }

    const metadataFile = file(METADATA_FILE_PATH)
    const exists = await metadataFile.exists()
    if (!exists) {
        await write(METADATA_FILE_PATH, '[]')
        return []
    }

    const parsedItems = parseJson<
        (Omit<ModelMetadata, 'lastChangedAt'> & { lastChangedAt?: number })[]
    >(await metadataFile.text(), [])

    return sortModelsByLastChangedAt(parsedItems.map(normalizeMetadataItem))
}

const writeMetadataList = async (items: ModelMetadata[]) => {
    if (!isOPFSAvailable()) {
        return
    }

    await write(
        METADATA_FILE_PATH,
        JSON.stringify(sortModelsByLastChangedAt(items), null, 2)
    )
}

const annotationsToDescription = (
    annotations: PersistedAnnotations | undefined
): string => {
    const unstructured: unknown = annotations?.unstructured

    if (!unstructured || typeof unstructured !== 'object') {
        return ''
    }

    const collectText = (value: unknown): string => {
        if (typeof value === 'string') {
            return value
        }

        if (Array.isArray(value)) {
            return value.map((entry) => collectText(entry)).join('')
        }

        if (!value || typeof value !== 'object') {
            return ''
        }

        const record = value as Record<string, unknown>
        if (typeof record.text === 'string') {
            return record.text
        }

        const children = record.children
        return Array.isArray(children)
            ? children.map((child) => collectText(child)).join('')
            : ''
    }

    const root = (unstructured as Record<string, unknown>).root
    if (!root || typeof root !== 'object') {
        return ''
    }

    const children = (root as Record<string, unknown>).children
    if (!Array.isArray(children)) {
        return ''
    }

    return children
        .map((child) => collectText(child).trim())
        .filter((text) => text.length > 0)
        .join('\n\n')
        .trim()
}

const EMPTY_SERIALIZED_EDITOR_STATE = {
    root: {
        children: [
            {
                children: [],
                direction: null,
                format: '',
                indent: 0,
                textFormat: 0,
                textStyle: '',
                type: 'paragraph',
                version: 1,
            },
        ],
        direction: null,
        format: '',
        indent: 0,
        type: 'root',
        version: 1,
    },
} as unknown as SerializedEditorState

const createPlainTextEditorState = (text: string): SerializedEditorState => {
    const paragraphs = text
        .split(/\n{2,}/)
        .map((paragraph) => paragraph.trim())
        .filter((paragraph) => paragraph.length > 0)

    if (paragraphs.length === 0) {
        return EMPTY_SERIALIZED_EDITOR_STATE
    }

    return {
        root: {
            ...EMPTY_SERIALIZED_EDITOR_STATE.root,
            children: paragraphs.map((paragraph) => ({
                children: [
                    {
                        detail: 0,
                        format: 0,
                        mode: 'normal',
                        style: '',
                        text: paragraph,
                        type: 'text',
                        version: 1,
                    },
                ],
                direction: null,
                format: '',
                indent: 0,
                textFormat: 0,
                textStyle: '',
                type: 'paragraph',
                version: 1,
            })),
        },
    }
}

const INTERCHANGE_FORMAT_SOURCE_TAGS: Partial<
    Record<InterchangeFormat, ModelMetadataTag>
> = {
    [InterchangeFormat.BNET]: 'BNET',
    [InterchangeFormat.SBML]: 'SBML-qual',
    [InterchangeFormat.GINML]: 'GINML',
    [InterchangeFormat.ZGINML]: 'GINML',
}

const hasTextualAnnotationContent = (
    annotations: PersistedAnnotations | undefined
): boolean => annotationsToDescription(annotations).length > 0

const hasAnnotationReferences = (
    annotations: PersistedAnnotations | undefined
): boolean => (annotations?.references?.length ?? 0) > 0

const hasAnnotations = (
    annotations: PersistedAnnotations | undefined
): boolean =>
    hasTextualAnnotationContent(annotations) ||
    hasAnnotationReferences(annotations)

const inferMetadataTags = ({
    snapshot,
    sourceFormat,
}: {
    snapshot: InternalGRNModel
    sourceFormat?: InterchangeFormat
}): ModelMetadataTag[] => {
    const tags: ModelMetadataTag[] = []
    const sourceTag = sourceFormat
        ? INTERCHANGE_FORMAT_SOURCE_TAGS[sourceFormat]
        : 'GRNCore'

    if (sourceTag) {
        tags.push(sourceTag)
    }

    const hasModelAnnotations = hasAnnotations(snapshot.annotations)
    const hasNodeAnnotations = snapshot.nodes.some((node) =>
        hasAnnotations(node.data.annotations)
    )
    const hasEdgeAnnotations = snapshot.edges.some((edge) =>
        hasAnnotations(edge.data?.annotations)
    )

    if (hasModelAnnotations || hasNodeAnnotations || hasEdgeAnnotations) {
        tags.push('Annotated')
    }

    return [...new Set(tags)]
}

const createMetadataFromSnapshot = (
    id: string,
    snapshot: InternalGRNModel,
    sourceFormat?: InterchangeFormat,
    metadataOverrides?: CreateLocalModelMetadataOverrides
): ModelMetadata => {
    const now = Date.now()
    const overrideTitle = metadataOverrides?.title?.trim()
    const normalizedTitle =
        overrideTitle && overrideTitle.length > 0
            ? overrideTitle
            : snapshot.title
    const normalizedAuthor = metadataOverrides?.author?.trim()
    const normalizedTags = metadataOverrides?.tags
        ? normalizeModelMetadataTags(metadataOverrides.tags)
        : inferMetadataTags({ snapshot, sourceFormat })

    return {
        id,
        title: normalizedTitle,
        filename: metadataOverrides?.filename?.trim() ?? undefined,
        description:
            metadataOverrides?.description ??
            annotationsToDescription(snapshot.annotations),
        author: normalizedAuthor ?? 'Unknown Author',
        tags: normalizedTags,
        createdAt: now,
        lastChangedAt: now,
    }
}

const UNTITLED_MODEL_PREFIX = 'Untitled model #'

const getNextUntitledModelTitle = (items: ModelMetadata[]): string => {
    const untitledModelTitlePattern = /^Untitled model #(\d+)$/
    const usedNumbers = new Set(
        items.flatMap((item) => {
            const match = untitledModelTitlePattern.exec(item.title.trim())
            return match ? [Number.parseInt(match[1], 10)] : []
        })
    )

    let nextNumber = 1
    while (usedNumbers.has(nextNumber)) {
        nextNumber += 1
    }

    return `${UNTITLED_MODEL_PREFIX}${nextNumber}`
}

const normalizeSnapshotTitleForCreate = (
    snapshot: InternalGRNModel,
    items: ModelMetadata[],
    metadataOverrides?: CreateLocalModelMetadataOverrides
): InternalGRNModel => {
    const preferredTitle =
        metadataOverrides?.title?.trim() ?? snapshot.title.trim()
    const normalizedTitle = preferredTitle.trim()
    if (normalizedTitle.length > 0) {
        return {
            ...snapshot,
            title: normalizedTitle,
        }
    }

    return {
        ...snapshot,
        title: getNextUntitledModelTitle(items),
    }
}

const applyMetadataOverridesToSnapshot = (
    snapshot: InternalGRNModel,
    metadataOverrides?: CreateLocalModelMetadataOverrides
): InternalGRNModel => {
    if (!metadataOverrides?.description) {
        return snapshot
    }

    return {
        ...snapshot,
        annotations: {
            references: snapshot.annotations?.references ?? [],
            unstructured: createPlainTextEditorState(
                metadataOverrides.description
            ),
        },
    }
}

const updateMetadataForSnapshot = (
    metadata: ModelMetadata,
    snapshot: InternalGRNModel
): ModelMetadata => ({
    ...metadata,
    title: snapshot.title,
    description: annotationsToDescription(snapshot.annotations),
    lastChangedAt: Date.now(),
})

export interface UpdateLocalModelDetailsInput extends ModelMetadataDetails {
    description: SerializedEditorState
}

export type CreateLocalModelMetadataOverrides = Partial<
    Pick<
        ModelMetadata,
        'title' | 'filename' | 'description' | 'author' | 'tags'
    >
>

const writeSnapshotFile = async (
    modelId: string,
    snapshot: InternalGRNModel,
    mutations?: SnapshotMutation[]
): Promise<void> => {
    const [serializedSnapshot] = await Promise.all([
        serializeSnapshotOffMainThread(modelId, snapshot, mutations),
        ensureSnapshotsDirectory(),
    ])
    await write(snapshotPath(modelId), serializedSnapshot)
}

export async function listLocalModels(): Promise<ModelMetadata[]> {
    return readMetadataList()
}

export async function getLocalModelSnapshot(
    modelId: string
): Promise<InternalGRNModel | null> {
    if (!isOPFSAvailable()) {
        return null
    }

    const target = file(snapshotPath(modelId))
    const exists = await target.exists()
    if (!exists) {
        return null
    }

    const serializedSnapshot = await target.arrayBuffer()
    const parsedSnapshot = await loadSnapshotOffMainThread(
        modelId,
        serializedSnapshot
    )

    if (!parsedSnapshot) {
        return null
    }

    return {
        ...createEmptyModelSnapshot(),
        ...parsedSnapshot,
    }
}

export async function createLocalModel(
    snapshot: InternalGRNModel,
    options?: {
        sourceFormat?: InterchangeFormat
        metadata?: CreateLocalModelMetadataOverrides
    }
): Promise<ModelMetadata> {
    if (!isOPFSAvailable()) {
        throw new Error('OPFS is not available in this environment.')
    }

    return enqueuePersistenceWrite(async () => {
        const modelId = crypto.randomUUID()
        const items = await readMetadataList()
        const normalizedSnapshot = normalizeSnapshotTitleForCreate(
            snapshot,
            items,
            options?.metadata
        )
        const snapshotWithMetadata = applyMetadataOverridesToSnapshot(
            normalizedSnapshot,
            options?.metadata
        )
        const metadata = createMetadataFromSnapshot(
            modelId,
            snapshotWithMetadata,
            options?.sourceFormat,
            options?.metadata
        )

        await writeSnapshotFile(modelId, snapshotWithMetadata)
        await writeMetadataList([...items, metadata])
        notifyLocalModelsChanged()

        return metadata
    })
}

export async function deleteLocalModel(modelId: string): Promise<void> {
    if (!isOPFSAvailable()) {
        return
    }

    await enqueuePersistenceWrite(async () => {
        const items = await readMetadataList()
        await writeMetadataList(items.filter((item) => item.id !== modelId))

        try {
            await file(snapshotPath(modelId)).remove()
        } catch {
            // Ignore missing snapshots so metadata cleanup can still succeed.
        }

        notifyLocalModelsChanged()
    })
}

export async function saveLocalModelSnapshot(
    modelId: string,
    snapshot: InternalGRNModel,
    mutations?: SnapshotMutation[]
): Promise<void> {
    if (!isOPFSAvailable()) {
        return
    }

    return enqueueCoalescedSnapshotWrite(modelId, snapshot, mutations)
}

interface PendingSnapshotWrite {
    snapshot: InternalGRNModel
    mutations: SnapshotMutation[] | null
}

interface SnapshotWriteState {
    active: boolean
    pending: PendingSnapshotWrite | null
    waiters: {
        resolve: () => void
        reject: (error: unknown) => void
    }[]
}

const snapshotWriteStates = new Map<string, SnapshotWriteState>()

const enqueueCoalescedSnapshotWrite = (
    modelId: string,
    snapshot: InternalGRNModel,
    mutations?: SnapshotMutation[]
): Promise<void> => {
    const state = snapshotWriteStates.get(modelId) ?? {
        active: false,
        pending: null,
        waiters: [],
    }
    if (!state.pending) {
        state.pending = {
            snapshot,
            mutations: mutations ? [...mutations] : null,
        }
    } else {
        state.pending.snapshot = snapshot
        state.pending.mutations =
            state.pending.mutations && mutations
                ? [...state.pending.mutations, ...mutations]
                : null
    }
    const promise = new Promise<void>((resolve, reject) => {
        state.waiters.push({ resolve, reject })
    })
    snapshotWriteStates.set(modelId, state)
    if (!state.active) void drainCoalescedSnapshotWrites(modelId, state)
    return promise
}

const drainCoalescedSnapshotWrites = async (
    modelId: string,
    state: SnapshotWriteState
) => {
    state.active = true
    startSaving()
    try {
        while (state.pending) {
            const nextWrite = state.pending
            state.pending = null
            await enqueuePersistenceWrite(async () => {
                await writeSnapshotFile(
                    modelId,
                    nextWrite.snapshot,
                    nextWrite.mutations ?? undefined
                )
                const items = await readMetadataList()
                const nextItems = items.map((item) =>
                    item.id === modelId
                        ? updateMetadataForSnapshot(item, nextWrite.snapshot)
                        : item
                )
                await writeMetadataList(nextItems)
            })
        }
        state.waiters.splice(0).forEach(({ resolve }) => resolve())
    } catch (error) {
        state.waiters.splice(0).forEach(({ reject }) => reject(error))
    } finally {
        state.active = false
        finishSaving()
        if (!state.pending) snapshotWriteStates.delete(modelId)
        else void drainCoalescedSnapshotWrites(modelId, state)
    }
}

export async function flushLocalModelSnapshots(): Promise<void> {
    await Promise.all(
        [...snapshotWriteStates.values()].map(
            (state) =>
                new Promise<void>((resolve) => {
                    if (!state.active && !state.pending) resolve()
                    else
                        state.waiters.push({ resolve, reject: () => resolve() })
                })
        )
    )
}

export async function updateLocalModelDetails(
    modelId: string,
    input: UpdateLocalModelDetailsInput
): Promise<ModelMetadata> {
    if (!isOPFSAvailable()) {
        throw new Error('OPFS is not available in this environment.')
    }

    startSaving()
    try {
        return await enqueuePersistenceWrite(async () => {
            const snapshot = await getLocalModelSnapshot(modelId)

            if (!snapshot) {
                throw new Error(`Model "${modelId}" was not found.`)
            }

            const normalizedDetails = normalizeModelMetadataDetails(input)
            const nextSnapshot: InternalGRNModel = {
                ...snapshot,
                title: normalizedDetails.title,
                annotations: {
                    references: snapshot.annotations?.references ?? [],
                    unstructured:
                        input.description ??
                        snapshot.annotations?.unstructured ??
                        EMPTY_SERIALIZED_EDITOR_STATE,
                },
            }

            const items = await readMetadataList()
            const existingMetadata = items.find((item) => item.id === modelId)

            if (!existingMetadata) {
                throw new Error(
                    `Metadata for model "${modelId}" was not found.`
                )
            }

            const updatedMetadata: ModelMetadata = {
                ...existingMetadata,
                title: normalizedDetails.title,
                description: annotationsToDescription(nextSnapshot.annotations),
                author: normalizedDetails.author,
                tags: normalizedDetails.tags,
                lastChangedAt: Date.now(),
            }

            await writeSnapshotFile(modelId, nextSnapshot)
            await writeMetadataList(
                items.map((item) =>
                    item.id === modelId ? updatedMetadata : item
                )
            )
            notifyLocalModelsChanged()

            return updatedMetadata
        })
    } finally {
        finishSaving()
    }
}
