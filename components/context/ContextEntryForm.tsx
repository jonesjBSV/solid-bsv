'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Brain,
  Save,
  Sparkles,
  Tag,
  Link,
  FileText,
  Lightbulb,
  CheckSquare,
  StickyNote,
  Hash,
  Plus,
  X,
  Wand2,
  Globe,
  Lock,
  Share2
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { NotarizationButton } from '@/components/bsv/NotarizationButton'
import { SharedResourceConfig } from '@/components/bsv/SharedResourceConfig'
import { NotarizationService } from '@/lib/bsv/notarization-service'

export interface ContextEntry {
  id?: string
  title?: string
  content: string
  category: 'note' | 'insight' | 'reference' | 'todo' | 'idea'
  tags: string[]
  privacyLevel: 'private' | 'shared' | 'public'
  author?: {
    did?: string
    solidWebId?: string
    signature?: string
  }
  bsvAttestation?: {
    txHash: string
    overlayTopic: string
    priceSatoshis?: number
  }
  relationships?: {
    linkedContexts: string[]
    referencedResources: string[]
    aiGeneratedLinks?: string[]
  }
  metadata?: {
    createdWith: 'manual' | 'import' | 'api' | 'ai'
    sourceUrl?: string
    aiEnhanced?: boolean
    quality?: number
  }
}

interface ContextEntryFormProps {
  onSubmit: (entry: ContextEntry) => void
  initialData?: Partial<ContextEntry>
  podResourceId?: string
}

export function ContextEntryForm({
  onSubmit,
  initialData,
  podResourceId,
}: ContextEntryFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [title, setTitle] = useState(initialData?.title || '')
  const [content, setContent] = useState(initialData?.content || '')
  const [category, setCategory] = useState<ContextEntry['category']>(initialData?.category || 'note')
  const [tags, setTags] = useState<string[]>(initialData?.tags || [])
  const [newTag, setNewTag] = useState('')
  const [privacyLevel, setPrivacyLevel] = useState<ContextEntry['privacyLevel']>(
    initialData?.privacyLevel || 'private'
  )
  const [linkedResources, setLinkedResources] = useState<string[]>([])
  const [isAIEnhancing, setIsAIEnhancing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  const categoryIcons = {
    note: <StickyNote className="h-4 w-4" />,
    insight: <Lightbulb className="h-4 w-4" />,
    reference: <FileText className="h-4 w-4" />,
    todo: <CheckSquare className="h-4 w-4" />,
    idea: <Brain className="h-4 w-4" />,
  }

  const privacyIcons = {
    private: <Lock className="h-4 w-4" />,
    shared: <Share2 className="h-4 w-4" />,
    public: <Globe className="h-4 w-4" />,
  }

  const handleAddTag = () => {
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag])
      setNewTag('')
    }
  }

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag))
  }

  const handleAIEnhance = async () => {
    if (!content) {
      toast({
        title: 'Content Required',
        description: 'Please enter some content to enhance',
        variant: 'destructive',
      })
      return
    }

    setIsAIEnhancing(true)
    try {
      // Mock AI enhancement - in production would call AI service
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Generate AI suggestions
      const suggestedTags = generateAISuggestedTags(content)
      const enhancedContent = await enhanceContentWithAI(content)
      
      setContent(enhancedContent)
      setTags([...new Set([...tags, ...suggestedTags])])

      toast({
        title: 'AI Enhancement Applied',
        description: 'Content enhanced with AI suggestions',
      })
    } catch (error) {
      toast({
        title: 'Enhancement Failed',
        description: 'Failed to enhance content with AI',
        variant: 'destructive',
      })
    } finally {
      setIsAIEnhancing(false)
    }
  }

  const handleSubmit = async () => {
    if (!content) {
      toast({
        title: 'Content Required',
        description: 'Please enter content for your context entry',
        variant: 'destructive',
      })
      return
    }

    setIsSaving(true)
    try {
      const entry: ContextEntry = {
        id: initialData?.id || `context_${Date.now()}`,
        title: title || undefined,
        content,
        category,
        tags,
        privacyLevel,
        relationships: {
          linkedContexts: [],
          referencedResources: podResourceId ? [podResourceId] : [],
          aiGeneratedLinks: [],
        },
        metadata: {
          createdWith: 'manual',
          aiEnhanced: false,
          quality: calculateQualityScore(content, tags),
        },
      }

      await onSubmit(entry)

      toast({
        title: 'Context Entry Saved',
        description: 'Your context entry has been saved successfully',
      })

      // Reset form
      setTitle('')
      setContent('')
      setTags([])
      setIsOpen(false)
    } catch (error) {
      toast({
        title: 'Save Failed',
        description: 'Failed to save context entry',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <>
      <Button onClick={() => setIsOpen(true)} className="gap-2">
        <Plus className="h-4 w-4" />
        Add Context Entry
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Create Context Entry
            </DialogTitle>
            <DialogDescription>
              Capture insights, notes, and ideas in your second brain
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Title (optional)</Label>
              <Input
                placeholder="Give your entry a memorable title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div>
              <Label>Content</Label>
              <Textarea
                placeholder="Write your thoughts, insights, or notes..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={8}
                className="resize-none"
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm text-muted-foreground">
                  {content.length} characters
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleAIEnhance}
                  disabled={isAIEnhancing || !content}
                >
                  {isAIEnhancing ? (
                    <>
                      <Wand2 className="h-4 w-4 mr-2 animate-spin" />
                      Enhancing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      AI Enhance
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Category</Label>
                <Select value={category} onValueChange={(v: any) => setCategory(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(categoryIcons).map(([key, icon]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          {icon}
                          <span className="capitalize">{key}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Privacy Level</Label>
                <Select value={privacyLevel} onValueChange={(v: any) => setPrivacyLevel(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(privacyIcons).map(([key, icon]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          {icon}
                          <span className="capitalize">{key}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Tags</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  placeholder="Add a tag..."
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddTag()
                    }
                  }}
                />
                <Button size="sm" onClick={handleAddTag}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    <Hash className="h-3 w-3" />
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            {podResourceId && (
              <Alert>
                <Link className="h-4 w-4" />
                <AlertDescription>
                  This context will be linked to the current pod resource
                </AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSaving || !content}
                className="flex-1"
              >
                {isSaving ? 'Saving...' : 'Save Entry'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

// AI helper functions (mock implementations)
function generateAISuggestedTags(content: string): string[] {
  // Mock AI tag generation
  const words = content.toLowerCase().split(/\W+/)
  const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for'])
  
  const keywords = words
    .filter(word => word.length > 4 && !commonWords.has(word))
    .slice(0, 5)
  
  return [...new Set(keywords)]
}

async function enhanceContentWithAI(content: string): Promise<string> {
  // Mock AI content enhancement
  const enhanced = content + '\n\n**AI Insights:**\n'
  const insights = [
    '- Consider exploring related concepts',
    '- This connects to broader themes in your knowledge base',
    '- Key takeaway: ' + content.split('.')[0],
  ]
  
  return enhanced + insights.join('\n')
}

function calculateQualityScore(content: string, tags: string[]): number {
  // Simple quality score calculation
  let score = 0
  
  if (content.length > 100) score += 0.2
  if (content.length > 500) score += 0.2
  if (tags.length > 0) score += 0.2
  if (tags.length > 3) score += 0.2
  if (content.includes('**') || content.includes('##')) score += 0.2 // Formatting
  
  return Math.min(score, 1)
}