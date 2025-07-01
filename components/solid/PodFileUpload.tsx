'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Upload, File, X, CheckCircle, AlertCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface PodFileUploadProps {
  isOpen: boolean
  onClose: () => void
  onUploadComplete: () => void
  podUrl: string
  currentPath: string
}

interface UploadFile {
  file: File
  progress: number
  status: 'pending' | 'uploading' | 'completed' | 'error'
  error?: string
}

export function PodFileUpload({
  isOpen,
  onClose,
  onUploadComplete,
  podUrl,
  currentPath,
}: PodFileUploadProps) {
  const [files, setFiles] = useState<UploadFile[]>([])
  const [uploadLocation, setUploadLocation] = useState('current')
  const [customPath, setCustomPath] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || [])
    const uploadFiles: UploadFile[] = selectedFiles.map(file => ({
      file,
      progress: 0,
      status: 'pending',
    }))
    setFiles(prev => [...prev, ...uploadFiles])
  }

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const getUploadPath = () => {
    if (uploadLocation === 'current') {
      return currentPath
    } else if (uploadLocation === 'root') {
      return '/'
    } else {
      return customPath.startsWith('/') ? customPath : `/${customPath}`
    }
  }

  const uploadFile = async (uploadFile: UploadFile, index: number) => {
    const formData = new FormData()
    formData.append('file', uploadFile.file)
    formData.append('targetPath', getUploadPath())
    formData.append('podUrl', podUrl)

    try {
      // Update status to uploading
      setFiles(prev => prev.map((f, i) => 
        i === index ? { ...f, status: 'uploading' } : f
      ))

      const response = await fetch('/api/solid/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Upload failed')
      }

      // Simulate progress for demo purposes
      for (let progress = 0; progress <= 100; progress += 10) {
        setFiles(prev => prev.map((f, i) => 
          i === index ? { ...f, progress } : f
        ))
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      // Mark as completed
      setFiles(prev => prev.map((f, i) => 
        i === index ? { ...f, status: 'completed', progress: 100 } : f
      ))
    } catch (error) {
      setFiles(prev => prev.map((f, i) => 
        i === index ? { 
          ...f, 
          status: 'error', 
          error: error instanceof Error ? error.message : 'Upload failed' 
        } : f
      ))
    }
  }

  const handleUpload = async () => {
    if (files.length === 0) return

    setIsUploading(true)

    try {
      // Upload files sequentially
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        if (file.status === 'pending') {
          await uploadFile(file, i)
        }
      }

      const successCount = files.filter(f => f.status === 'completed').length
      const errorCount = files.filter(f => f.status === 'error').length

      if (successCount > 0) {
        toast({
          title: 'Upload Complete',
          description: `Successfully uploaded ${successCount} file(s)${errorCount > 0 ? ` (${errorCount} failed)` : ''}`,
        })
        onUploadComplete()
      }

      if (errorCount === files.length) {
        toast({
          title: 'Upload Failed',
          description: 'All uploads failed',
          variant: 'destructive',
        })
      }
    } finally {
      setIsUploading(false)
    }
  }

  const handleClose = () => {
    if (!isUploading) {
      setFiles([])
      setCustomPath('')
      setUploadLocation('current')
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      onClose()
    }
  }

  const formatFileSize = (bytes: number) => {
    const units = ['B', 'KB', 'MB', 'GB']
    let size = bytes
    let unitIndex = 0
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024
      unitIndex++
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`
  }

  const allCompleted = files.length > 0 && files.every(f => f.status === 'completed')
  const hasErrors = files.some(f => f.status === 'error')

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Upload Files to Pod</DialogTitle>
          <DialogDescription>
            Upload files to your SOLID Pod at {podUrl}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Upload Location Selection */}
          <div className="space-y-2">
            <Label>Upload Location</Label>
            <Select value={uploadLocation} onValueChange={setUploadLocation}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current">Current Path ({currentPath})</SelectItem>
                <SelectItem value="root">Root Directory (/)</SelectItem>
                <SelectItem value="custom">Custom Path</SelectItem>
              </SelectContent>
            </Select>
            {uploadLocation === 'custom' && (
              <Input
                placeholder="/path/to/upload"
                value={customPath}
                onChange={(e) => setCustomPath(e.target.value)}
              />
            )}
          </div>

          {/* File Selection */}
          <div className="space-y-2">
            <Label>Select Files</Label>
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
              <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-2">
                Click to select files or drag and drop
              </p>
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                Choose Files
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="space-y-2">
              <Label>Files to Upload</Label>
              <div className="border rounded-lg p-4 max-h-48 overflow-y-auto space-y-3">
                {files.map((uploadFile, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <File className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium truncate">
                          {uploadFile.file.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          ({formatFileSize(uploadFile.file.size)})
                        </span>
                        {uploadFile.status === 'completed' && (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        )}
                        {uploadFile.status === 'error' && (
                          <AlertCircle className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                      {uploadFile.status === 'uploading' && (
                        <Progress value={uploadFile.progress} className="h-1 mt-1" />
                      )}
                      {uploadFile.status === 'error' && uploadFile.error && (
                        <p className="text-xs text-red-600 mt-1">{uploadFile.error}</p>
                      )}
                    </div>
                    {!isUploading && uploadFile.status === 'pending' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload Status */}
          {hasErrors && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Some files failed to upload. Check the file list for details.
              </AlertDescription>
            </Alert>
          )}

          {allCompleted && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                All files uploaded successfully!
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isUploading}
          >
            {allCompleted ? 'Done' : 'Cancel'}
          </Button>
          {!allCompleted && (
            <Button
              onClick={handleUpload}
              disabled={files.length === 0 || isUploading}
            >
              {isUploading ? 'Uploading...' : 'Upload Files'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}