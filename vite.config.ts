import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

const repositoryName = process.env.GITHUB_REPOSITORY?.split('/')[1]
const githubPagesBase =
    process.env.GITHUB_ACTIONS === 'true' && repositoryName
        ? `/${repositoryName}/`
        : '/'

// https://vite.dev/config/
export default defineConfig({
    base: githubPagesBase,
    plugins: [
        react({
            babel: {
                plugins: [['babel-plugin-react-compiler']],
            },
        }),
        tailwindcss(),
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    define: {
        __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    },
    build: {
        chunkSizeWarningLimit: 800,
        rollupOptions: {
            output: {
                manualChunks(id) {
                    const normalizedId = id.replace(/\\/g, '/')
                    const nodeModulesMarker = '/node_modules/'
                    const markerIndex =
                        normalizedId.lastIndexOf(nodeModulesMarker)

                    if (markerIndex === -1) return undefined

                    const packagePath = normalizedId
                        .slice(markerIndex + nodeModulesMarker.length)
                        .split('/')
                    const isScopedPackage = packagePath[0]?.startsWith('@')
                    const packageName = isScopedPackage
                        ? `${packagePath[0]}-${packagePath[1]}`
                        : packagePath[0]

                    if (!packageName) return 'vendor'

                    if (
                        packageName === 'react' ||
                        packageName === 'react-dom'
                    ) {
                        return 'vendor-react'
                    }
                    if (
                        packageName === 'lexical' ||
                        packageName === '@lexical/code-shiki' ||
                        packageName === '@lexical/extension' ||
                        packageName === '@lexical/link' ||
                        packageName === '@lexical/list' ||
                        packageName === '@lexical/react' ||
                        packageName === '@lexical/rich-text' ||
                        packageName === '@lexical/selection' ||
                        packageName === '@lexical/table' ||
                        packageName === '@lexical/utils'
                    ) {
                        return 'vendor-lexical'
                    }
                    if (
                        packageName === 'monaco-editor' ||
                        packageName === '@monaco-editor/react'
                    ) {
                        return 'vendor-monaco'
                    }
                    if (packageName === '@xyflow/react') {
                        return 'vendor-xyflow'
                    }
                    if (packageName === 'react-day-picker') {
                        return 'vendor-datepicker'
                    }
                    if (packageName.startsWith('@tanstack')) {
                        return 'vendor-tanstack'
                    }
                    if (
                        packageName.startsWith('@radix-ui') ||
                        packageName.startsWith('@floating-ui')
                    ) {
                        return 'vendor-ui'
                    }
                    if (packageName.startsWith('@antv-')) {
                        return `vendor-${packageName.replace(/[^a-zA-Z0-9_-]/g, '-')}`
                    }

                    return `vendor-${packageName.replace(/[^a-zA-Z0-9_-]/g, '-')}`
                },
            },
        },
    },
})
