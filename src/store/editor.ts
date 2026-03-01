import { Graph as G6Graph } from '@antv/g6'
import { type RefObject } from 'react'
import { create } from 'zustand'

interface EditorState {
    graphRef?: RefObject<G6Graph>
    setGraphRef: (ref: RefObject<G6Graph>) => void
}

export const useEditorStore = create<EditorState>((set) => ({
    graphRef: undefined,
    setGraphRef: (ref: RefObject<G6Graph>) => set(() => ({ graphRef: ref })),
}))
