import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    FileUpload,
    FileUploadDropzone,
    FileUploadItem,
    FileUploadItemMetadata,
    FileUploadList,
    FileUploadTrigger,
    TRIGGER_NAME,
    useFileUploadContext,
} from '@/components/ui/file-upload'
import { getInterchangeFormat } from '@/lib/interchange'
import { useChangesTracking, useEditorStore } from '@/store'
import { Upload } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { twMerge } from 'tailwind-merge'
import { useShallow } from 'zustand/react/shallow'

function AutoOpenFilePicker({
    open,
}: {
    open: boolean
}) {
    const { inputRef, disabled } = useFileUploadContext(TRIGGER_NAME)

    useEffect(() => {
        if (!open || disabled) return

        const frame = requestAnimationFrame(() => {
            inputRef.current?.click()
        })

        return () => cancelAnimationFrame(frame)
    }, [disabled, inputRef, open])

    return null
}

export function ImportModelDialog() {
    const { open, setOpen } = useEditorStore(
        useShallow((state) => ({
            open: state.importModelDialogVisible,
            setOpen: state.setImportModelDialogVisible,
        }))
    )
    const importModel = useChangesTracking((state) => state.import)
    const [files, setFiles] = useState<File[]>([])

    const onFileValidate = useCallback((file: File): string | null => {
        try {
            getInterchangeFormat(file.name)
        } catch (error) {
            return (error as Error).message
        }

        return null
    }, [])

    const onFileReject = useCallback((file: File, message: string) => {
        toast.error(message, {
            description: `"${file.name.length > 20 ? `${file.name.slice(0, 20)}...` : file.name}" has been rejected`,
            position: 'top-right',
        })
    }, [])

    const setDialogOpen = (open: boolean) => {
        setOpen(open)
        if (!open) {
            setTimeout(() => setFiles([]), 500)
        }
    }

    useEffect(() => {
        if (files.length > 0) {
            importModel(files[0], (hasError) => {
                if (hasError) {
                    setTimeout(() => setFiles([]), 200)
                } else {
                    setTimeout(() => {
                        setOpen(false)
                        setTimeout(() => setFiles([]), 500)
                    }, 500)
                }
            })
        }
    }, [files, importModel, setOpen])

    return (
        <Dialog open={open} onOpenChange={setDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Import Model</DialogTitle>
                    <DialogDescription>
                        Upload a model file to import it into the editor.
                        Supported formats are: <br /> BoolNet (.bnet), SBML-Qual
                        (.sbml), GINsim (.zginml, .ginml)
                    </DialogDescription>
                </DialogHeader>
                <FileUpload
                    value={files}
                    onValueChange={setFiles}
                    onFileValidate={onFileValidate}
                    onFileReject={onFileReject}
                    accept="application/sbml+xml,.bnet,.zginml,.sbml,.ginml"
                    maxFiles={1}
                    className="w-full max-w-md"
                >
                    <AutoOpenFilePicker open={open && files.length === 0} />
                    <FileUploadDropzone
                        className={twMerge(files.length > 0 && 'hidden')}
                    >
                        <div className="flex flex-col items-center gap-1">
                            <div className="flex items-center justify-center rounded-full border p-2.5">
                                <Upload className="size-6 text-muted-foreground" />
                            </div>
                            <p className="font-medium text-sm">
                                Drag & drop model here
                            </p>
                            <p className="text-muted-foreground text-xs">
                                Or click to browse
                            </p>
                        </div>
                        <FileUploadTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                className="mt-2 w-fit"
                            >
                                Browse files
                            </Button>
                        </FileUploadTrigger>
                    </FileUploadDropzone>
                    <FileUploadList>
                        {files.map((file) => (
                            <FileUploadItem key={file.name} value={file}>
                                <FileUploadItemMetadata />
                                <Badge variant="ghost">
                                    <span className="inline-flex items-center overflow-hidden transition-[width] duration-100 ease-in-out">
                                        <span className="inline-flex items-center gap-2 animate-in fade-in-0 slide-in-from-bottom-1 duration-100 whitespace-nowrap">
                                            <span className="size-3.5 shrink-0 rounded-full border-2 border-blue-200 border-t-blue-500 animate-spin" />
                                            Importing
                                        </span>
                                    </span>
                                </Badge>
                            </FileUploadItem>
                        ))}
                    </FileUploadList>
                </FileUpload>
            </DialogContent>
        </Dialog>
    )
}
