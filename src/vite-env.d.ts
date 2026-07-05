// vite-env.d.ts
declare const __APP_VERSION__: string

declare module 'monaco-editor/esm/vs/editor/editor.api' {
    export * from 'monaco-editor'
}
