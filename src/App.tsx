import { AppSidebar } from '@/components/layouts/sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { useEffect } from 'react'
import { EditorView } from './components/views'
import { Toaster } from './components/ui/sonner'

export default function Page() {
    useEffect(() => {
        document.title = 'GRN Core'
    }, [])

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <EditorView />
            </SidebarInset>
            {/* Toaster Notifications */}
            <Toaster
                toastOptions={{
                    classNames: {
                        icon: '!text-[#3B82F6]',
                        description: '!text-muted-foreground',
                    },
                }}
            />
        </SidebarProvider>
    )
}
