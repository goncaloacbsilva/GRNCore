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
    FileUploadItemDelete,
    FileUploadItemMetadata,
    FileUploadList,
    FileUploadTrigger,
} from '@/components/ui/file-upload'
import { getInterchangeFormat } from '@/lib/interchange'
import { useChangesTracking, useEditorStore } from '@/store'
import { Upload, X } from 'lucide-react'
import { useCallback, useState } from 'react'
import { toast } from 'sonner'
import { useShallow } from 'zustand/react/shallow'

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

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Import Model</DialogTitle>
                    <DialogDescription>
                        Upload a model file to import it into the editor.
                        <br />
                        Supported formats are: BoolNet (.bnet), SBML-Qual
                        (.sbml)
                    </DialogDescription>
                </DialogHeader>
                <FileUpload
                    value={files}
                    onValueChange={setFiles}
                    onFileValidate={onFileValidate}
                    onFileReject={onFileReject}
                    accept="application/sbml+xml,.bnet,.zginml,.sbml"
                    maxFiles={1}
                    className="w-full max-w-md"
                >
                    <FileUploadDropzone>
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
                                <FileUploadItemDelete asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="size-7"
                                    >
                                        <X />
                                    </Button>
                                </FileUploadItemDelete>
                            </FileUploadItem>
                        ))}
                    </FileUploadList>
                </FileUpload>
                <Button
                    hidden={files.length === 0}
                    onClick={() =>
                        importModel(files[0], () => {
                            setFiles([])
                            setOpen(false)
                        })
                    }
                >
                    Import Model
                </Button>
            </DialogContent>
        </Dialog>
    )
}
