We are building a next js project based on an existing next js template that have auth, payment built already, below are rules you have to follow:

<frontend rules>
1. MUST Use 'use client' directive for client-side components; In Next.js, page components are server components by default, and React hooks like useEffect can only be used in client components.
2. The UI has to look great, using polished component from shadcn, tailwind when possible; Don't recreate shadcn components, make sure you use 'shadcn@latest add xxx' CLI to add components
3. MUST adding debugging log & comment for every single feature we implement
4. Make sure to concatenate strings correctly using backslash
7. Use stock photos from picsum.photos where appropriate, only valid URLs you know exist
8. Don't update shadcn components unless otherwise specified
9. Configure next.config.js image remotePatterns to enable stock photos from picsum.photos
11. MUST implement the navigation elements items in their rightful place i.e. Left sidebar, Top header
12. Accurately implement necessary grid layouts
13. Follow proper import practices:
   - Use @/ path aliases
   - Keep component imports organized
   - Update current src/app/page.tsx with new comprehensive code
   - Don't forget root route (page.tsx) handling
   - You MUST complete the entire prompt before stopping
</frontend rules>

<styling_requirements>
- You ALWAYS tries to use the shadcn/ui library.
- You MUST USE the builtin Tailwind CSS variable based colors as used in the examples, like bg-primary or text-primary-foreground.
- You DOES NOT use indigo or blue colors unless specified in the prompt.
- You MUST generate responsive designs.
- The React Code Block is rendered on top of a white background. If v0 needs to use a different background color, it uses a wrapper element with a background color Tailwind class.
</styling_requirements>

<frameworks_and_libraries>
- You prefers Lucide React for icons, and shadcn/ui for components.
- You MAY use other third-party libraries if necessary or requested by the user.
- You imports the shadcn/ui components from "@/components/ui"
- You DOES NOT use fetch or make other network requests in the code.
- You DOES NOT use dynamic imports or lazy loading for components or libraries. Ex: const Confetti = dynamic(...) is NOT allowed. Use import Confetti from 'react-confetti' instead.
- Prefer using native Web APIs and browser features when possible. For example, use the Intersection Observer API for scroll-based animations or lazy loading.
</frameworks_and_libraries>

# SOLID Pod Second Brain Context Store Implementation Guide

## Task Overview
Implement a "Second Brain" context store feature that leverages SOLID pods for persistent storage, BSV for timestamping, and overlay topics for sharing. This feature allows users to save and manage context entries (notes, data snippets, metadata) that can be retrieved for LLM integrations and shared with micropayment access.

## Implementation Steps

### Overview
The Second Brain feature integrates with the pod-centric architecture where context entries are stored as resources in the user's SOLID pod, tracked in Supabase, timestamped on BSV blockchain, and optionally published to overlay topics for discovery and monetization.

### Step 1: Create the Second Brain Page

1. **File Structure**:  
   - Create a new page at `app/context/page.tsx`.
   - This integrates with the main navigation as "Second Brain Context Layer".

2. **Page Setup**:  
   - Use the `page.tsx` file to define the main layout for the Second Brain feature.
   - Import necessary components from `shadcn/ui` and Tailwind CSS for styling.
   - Include both the context entry form and list in a cohesive layout.

3. **Responsive Layout**:  
   - Ensure the layout is responsive using Tailwind's utility classes.
   - Use Tailwind's variable-based colors (e.g., `bg-primary`, `text-primary-foreground`) for consistent styling.
   - Create a two-panel layout: entry form on top/left, context list on bottom/right.

### Step 2: Build the Context Entry Form with Pod Integration

1. **Component Creation**:  
   - Create a `ContextEntryForm.tsx` component in `components/app/`.
   - Use `shadcn/ui` Form components to build a form that allows users to add new context entries.
   - Integrate with SOLID pod storage for persistence.

2. **Form Fields**:  
   - **Content**: Rich text area for the main context/note content
   - **Title**: Optional title for the context entry
   - **Tags**: Comma-separated tags for organization
   - **Privacy Level**: Private (pod only), Shared (overlay), or Public (overlay + discovery)
   - **Link to Pod Resource**: Optional association with existing pod resources
   - **Category**: Type of context (note, insight, reference, todo, etc.)

3. **Pod Integration Example**:
   ```typescript
   import { useState } from 'react';
   import { Button, Card, Form, Input, Textarea, Select, Badge } from '@/components/ui';
   import { Save, Upload, Share, Brain } from 'lucide-react';
   import { createSupabaseClient } from '@/utils/supabase/client';

   export const ContextEntryForm = ({ onEntryAdded }: { onEntryAdded: (entry: any) => void }) => {
     const [formData, setFormData] = useState({
       title: '',
       content: '',
       tags: '',
       privacy_level: 'private',
       category: 'note',
       pod_resource_id: null
     });
     const [saving, setSaving] = useState(false);

     const handleSubmit = async (e: React.FormEvent) => {
       e.preventDefault();
       console.log('Submitting new context entry:', formData);
       setSaving(true);

       try {
         // 1. Store in SOLID pod as a context resource
         const podResourcePath = `context/${Date.now()}-${formData.title || 'untitled'}.json`;
         const contextData = {
           ...formData,
           created_at: new Date().toISOString(),
           type: 'context_entry'
         };

         console.log('Storing context entry in SOLID pod:', podResourcePath);
         // ... SOLID pod storage logic ...

         // 2. Create content hash for BSV timestamping
         const contentHash = await hashContent(contextData);

         // 3. Save to Supabase context_entry table
         const supabase = await createSupabaseClient();
         const { data: newEntry, error } = await supabase
           .from('context_entry')
           .insert({
             content: formData.content,
             metadata: {
               title: formData.title,
               tags: formData.tags.split(',').map(t => t.trim()),
               privacy_level: formData.privacy_level,
               category: formData.category,
               pod_path: podResourcePath,
               content_hash: contentHash
             },
             pod_resource_id: formData.pod_resource_id
           })
           .select()
           .single();

         if (error) {
           console.error('Error saving context entry:', error);
           throw error;
         }

         console.log('Context entry saved successfully:', newEntry);

         // 4. Optional: Create BSV attestation if sharing
         if (formData.privacy_level !== 'private') {
           console.log('Creating BSV attestation for shared context entry');
           const bsvTxHash = await createBSVAttestation(newEntry.id, 'context', contentHash);
           
           // Update entry with BSV hash
           await supabase
             .from('context_entry')
             .update({ bsv_tx_hash: bsvTxHash })
             .eq('id', newEntry.id);

           newEntry.bsv_tx_hash = bsvTxHash;
         }

         // 5. Reset form and notify parent
         setFormData({
           title: '',
           content: '',
           tags: '',
           privacy_level: 'private',
           category: 'note',
           pod_resource_id: null
         });
         
         onEntryAdded(newEntry);
         
       } catch (error) {
         console.error('Failed to save context entry:', error);
       } finally {
         setSaving(false);
       }
     };

     return (
       <Card className="p-6 bg-primary text-primary-foreground">
         <div className="flex items-center gap-2 mb-4">
           <Brain className="w-5 h-5" />
           <h2 className="text-xl font-semibold">Add to Second Brain</h2>
         </div>
         
         <form onSubmit={handleSubmit} className="space-y-4">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <Input
               placeholder="Entry title (optional)"
               value={formData.title}
               onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
             />
             <Select
               value={formData.category}
               onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
             >
               <option value="note">Note</option>
               <option value="insight">Insight</option>
               <option value="reference">Reference</option>
               <option value="todo">Todo</option>
               <option value="idea">Idea</option>
             </Select>
           </div>

           <Textarea
             placeholder="Enter your context, notes, or thoughts..."
             value={formData.content}
             onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
             className="min-h-32"
             required
           />

           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <Input
               placeholder="Tags (comma separated)"
               value={formData.tags}
               onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
             />
             <Select
               value={formData.privacy_level}
               onValueChange={(value) => setFormData(prev => ({ ...prev, privacy_level: value }))}
             >
               <option value="private">Private (Pod Only)</option>
               <option value="shared">Shared (Overlay)</option>
               <option value="public">Public (Discovery)</option>
             </Select>
           </div>

           <div className="flex gap-2">
             <Button type="submit" disabled={saving || !formData.content}>
               {saving ? (
                 <>
                   <Upload className="w-4 h-4 mr-2 animate-spin" />
                   Saving...
                 </>
               ) : (
                 <>
                   <Save className="w-4 h-4 mr-2" />
                   Save to Pod
                 </>
               )}
             </Button>
             
             {formData.privacy_level !== 'private' && (
               <Badge variant="secondary">
                 <Share className="w-3 h-3 mr-1" />
                 Will be shared
               </Badge>
             )}
           </div>
         </form>
       </Card>
     );
   };
   ```

### Step 3: Display Context Entries with Pod Status

1. **Component Creation**:  
   - Create a `ContextEntryCard.tsx` component in `components/app/`.
   - Display context entries with pod storage status, BSV attestation, and sharing information.

2. **Enhanced Context Entry Card**:
   ```typescript
   import { useState } from 'react';
   import { Card, Badge, Button } from '@/components/ui';
   import { Brain, Hash, ExternalLink, Share, Clock, CheckCircle } from 'lucide-react';

   export const ContextEntryCard = ({ entry, onUpdate }: { entry: any, onUpdate: (entry: any) => void }) => {
     const [sharing, setSharing] = useState(false);

     const handleShare = async () => {
       console.log('Sharing context entry to overlay:', entry.id);
       setSharing(true);
       try {
         // Create shared_resource record and publish to overlay
         const supabase = await createSupabaseClient();
         const { data } = await supabase
           .from('shared_resource')
           .insert({
             resource_type: 'context_entry',
             resource_id: entry.id,
             price_satoshis: 100, // Default price
             overlay_topic: `context_${entry.metadata?.category || 'general'}`,
             access_policy: { type: 'micropayment' }
           })
           .select()
           .single();

         console.log('Context entry shared successfully:', data);
         onUpdate({ ...entry, shared: true });
       } catch (error) {
         console.error('Failed to share context entry:', error);
       } finally {
         setSharing(false);
       }
     };

     const getPrivacyBadge = () => {
       const level = entry.metadata?.privacy_level || 'private';
       const variants = {
         private: 'default',
         shared: 'secondary',
         public: 'outline'
       };
       return <Badge variant={variants[level]}>{level}</Badge>;
     };

     const getCategoryIcon = () => {
       const category = entry.metadata?.category || 'note';
       const icons = {
         note: Brain,
         insight: '💡',
         reference: '📖',
         todo: '✓',
         idea: '🚀'
       };
       const Icon = icons[category];
       return typeof Icon === 'string' ? <span>{Icon}</span> : <Icon className="w-4 h-4" />;
     };

     return (
       <Card className="p-4 space-y-3">
         <div className="flex justify-between items-start">
           <div className="flex items-center gap-2">
             {getCategoryIcon()}
             <h3 className="font-semibold">
               {entry.metadata?.title || 'Untitled Context'}
             </h3>
           </div>
           <div className="flex gap-2">
             {getPrivacyBadge()}
             {entry.bsv_tx_hash && (
               <Badge variant="outline">
                 <CheckCircle className="w-3 h-3 mr-1" />
                 Attested
               </Badge>
             )}
           </div>
         </div>

         <p className="text-sm text-muted-foreground line-clamp-3">
           {entry.content}
         </p>

         {entry.metadata?.tags && (
           <div className="flex flex-wrap gap-1">
             {entry.metadata.tags.map((tag: string, index: number) => (
               <Badge key={index} variant="outline" className="text-xs">
                 {tag}
               </Badge>
             ))}
           </div>
         )}

         <div className="flex justify-between items-center text-xs text-muted-foreground">
           <div className="flex items-center gap-4">
             <span className="flex items-center gap-1">
               <Clock className="w-3 h-3" />
               {new Date(entry.created_at).toLocaleDateString()}
             </span>
             {entry.bsv_tx_hash && (
               <span className="flex items-center gap-1">
                 <Hash className="w-3 h-3" />
                 {entry.bsv_tx_hash.substring(0, 8)}...
               </span>
             )}
           </div>
           
           <div className="flex gap-2">
             {entry.metadata?.privacy_level === 'private' && (
               <Button size="sm" variant="outline" onClick={handleShare} disabled={sharing}>
                 {sharing ? 'Sharing...' : (
                   <>
                     <Share className="w-3 h-3 mr-1" />
                     Share
                   </>
                 )}
               </Button>
             )}
             
             {entry.bsv_tx_hash && (
               <Button size="sm" variant="outline">
                 <ExternalLink className="w-3 h-3 mr-1" />
                 View Proof
               </Button>
             )}
           </div>
         </div>
       </Card>
     );
   };
   ```

### Step 4: Advanced Features

1. **Search and Filter**:
   ```typescript
   export const ContextSearch = ({ onFilter }: { onFilter: (criteria: any) => void }) => {
     const [searchTerm, setSearchTerm] = useState('');
     const [selectedCategory, setSelectedCategory] = useState('all');
     const [selectedTags, setSelectedTags] = useState<string[]>([]);

     useEffect(() => {
       console.log('Applying context filters:', { searchTerm, selectedCategory, selectedTags });
       onFilter({
         search: searchTerm,
         category: selectedCategory === 'all' ? null : selectedCategory,
         tags: selectedTags
       });
     }, [searchTerm, selectedCategory, selectedTags]);

     return (
       <div className="space-y-4 p-4 bg-muted rounded-lg">
         <Input
           placeholder="Search context entries..."
           value={searchTerm}
           onChange={(e) => setSearchTerm(e.target.value)}
           className="w-full"
         />
         
         <div className="flex gap-2 flex-wrap">
           <Select value={selectedCategory} onValueChange={setSelectedCategory}>
             <option value="all">All Categories</option>
             <option value="note">Notes</option>
             <option value="insight">Insights</option>
             <option value="reference">References</option>
             <option value="todo">Todos</option>
             <option value="idea">Ideas</option>
           </Select>
         </div>
       </div>
     );
   };
   ```

2. **Pod Sync Status**:
   ```typescript
   export const PodSyncStatus = ({ entries }: { entries: any[] }) => {
     const [syncStats, setSyncStats] = useState({
       total: 0,
       synced: 0,
       pending: 0,
       failed: 0
     });

     useEffect(() => {
       const stats = entries.reduce((acc, entry) => {
         acc.total++;
         if (entry.pod_sync_status === 'synced') acc.synced++;
         else if (entry.pod_sync_status === 'pending') acc.pending++;
         else if (entry.pod_sync_status === 'failed') acc.failed++;
         return acc;
       }, { total: 0, synced: 0, pending: 0, failed: 0 });
       
       setSyncStats(stats);
     }, [entries]);

     return (
       <Card className="p-4">
         <h3 className="font-semibold mb-2">Pod Sync Status</h3>
         <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
           <div className="text-center">
             <div className="text-lg font-bold">{syncStats.total}</div>
             <div className="text-muted-foreground">Total</div>
           </div>
           <div className="text-center">
             <div className="text-lg font-bold text-green-600">{syncStats.synced}</div>
             <div className="text-muted-foreground">Synced</div>
           </div>
           <div className="text-center">
             <div className="text-lg font-bold text-yellow-600">{syncStats.pending}</div>
             <div className="text-muted-foreground">Pending</div>
           </div>
           <div className="text-center">
             <div className="text-lg font-bold text-red-600">{syncStats.failed}</div>
             <div className="text-muted-foreground">Failed</div>
           </div>
         </div>
       </Card>
     );
   };
   ```

### Step 5: State Management with Pod Integration

1. **Enhanced Context Entry Interface**:
   ```typescript
   export interface ContextEntry {
     id: string;
     content: string;
     metadata: {
       title?: string;
       tags: string[];
       privacy_level: 'private' | 'shared' | 'public';
       category: string;
       pod_path: string;
       content_hash: string;
       pod_sync_status?: 'synced' | 'pending' | 'failed';
     };
     pod_resource_id?: number;
     bsv_tx_hash?: string;
     overlay_topic?: string;
     created_at: string;
     updated_at: string;
   }
   ```

2. **Context State Management**:
   ```typescript
   export const useContextEntries = () => {
     const [entries, setEntries] = useState<ContextEntry[]>([]);
     const [loading, setLoading] = useState(false);
     const [filters, setFilters] = useState({});

     const fetchEntries = async () => {
       console.log('Fetching context entries from Supabase');
       setLoading(true);
       try {
         const supabase = await createSupabaseClient();
         const { data, error } = await supabase
           .from('context_entry')
           .select('*')
           .order('created_at', { ascending: false });

         if (error) throw error;
         
         console.log('Context entries loaded:', data.length);
         setEntries(data);
       } catch (error) {
         console.error('Failed to fetch context entries:', error);
       } finally {
         setLoading(false);
       }
     };

     const addEntry = (newEntry: ContextEntry) => {
       console.log('Adding new context entry to state:', newEntry.id);
       setEntries(prev => [newEntry, ...prev]);
     };

     const updateEntry = (updatedEntry: ContextEntry) => {
       console.log('Updating context entry in state:', updatedEntry.id);
       setEntries(prev => prev.map(entry => 
         entry.id === updatedEntry.id ? updatedEntry : entry
       ));
     };

     const filteredEntries = useMemo(() => {
       return entries.filter(entry => {
         if (filters.search && !entry.content.toLowerCase().includes(filters.search.toLowerCase())) {
           return false;
         }
         if (filters.category && entry.metadata.category !== filters.category) {
           return false;
         }
         if (filters.tags?.length && !filters.tags.some(tag => entry.metadata.tags.includes(tag))) {
           return false;
         }
         return true;
       });
     }, [entries, filters]);

     return {
       entries: filteredEntries,
       loading,
       fetchEntries,
       addEntry,
       updateEntry,
       setFilters
     };
   };
   ```

### Debug Logging

- **Comprehensive Logging**:
  ```typescript
  const debugContext = {
    formSubmission: (data: any) => {
      console.log('[CONTEXT FORM] Submitting entry:', data);
      console.time('context-save');
    },
    
    podStorage: (path: string) => {
      console.log('[POD STORAGE] Saving to path:', path);
    },
    
    bsvAttestation: (entryId: string, txHash: string) => {
      console.log('[BSV ATTESTATION] Entry:', entryId, 'TX:', txHash);
    },
    
    overlayShare: (entryId: string, topic: string) => {
      console.log('[OVERLAY SHARE] Entry:', entryId, 'Topic:', topic);
    },
    
    complete: (entryId: string) => {
      console.timeEnd('context-save');
      console.log('[CONTEXT COMPLETE] Entry saved:', entryId);
    },
    
    error: (operation: string, error: any) => {
      console.error(`[CONTEXT ERROR] ${operation}:`, error);
    }
  };
  ```

### Summary

This implementation provides:

- **Pod-Centric Storage**: Context entries stored as resources in user's SOLID pod
- **BSV Timestamping**: Optional blockchain attestation for shared contexts
- **Overlay Discovery**: Shared contexts published to BSV overlay topics
- **Rich Metadata**: Tags, categories, privacy levels for organization
- **Search & Filter**: Advanced filtering by content, tags, and categories
- **Micropayment Ready**: Integration with sharing and monetization features
- **Real-time Sync**: Status tracking for pod synchronization
- **Responsive UI**: Modern interface using shadcn/ui components

The feature creates a comprehensive knowledge management system that leverages the pod-centric architecture while providing blockchain verification and monetization capabilities through the BSV overlay network.