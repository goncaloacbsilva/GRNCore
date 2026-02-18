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
})
