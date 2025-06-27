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

# BSV Pod Notarization & Overlay Integration Implementation Guide

## Task
Integrate BSV notarization functionality for SOLID pod resources with overlay topics, allowing users to timestamp their pod contents and publish them to BSV overlay for public discovery in the pod-centric architecture.

## Implementation Guide

### Overview
This feature allows users to notarize (timestamp) their SOLID pod resources using BSV blockchain, providing immutable proof of existence and an audit trail. Resources can be published to BSV overlay topics for public discovery while maintaining the pod-centric architecture where the SOLID pod serves as the user's personal data vault.

### Step 1: Set Up the Pod Notarization Interface

1. **Integrate with Pod Management Dashboard:**
   - Add notarization functionality directly to the existing Pod Management dashboard (`app/pod/page.tsx`).
   - Each pod resource will have a "Notarize" button alongside "Edit" and "Share" actions.

2. **Design the Notarization UI:**
   - Use `shadcn/ui` components to enhance the existing pod resource cards with notarization status.
   - Add status badges: "Not Notarized", "Notarizing...", "Notarized", "Failed".
   - Include BSV transaction hash display when notarized.
   - Show overlay topic information for public discovery.
   - Use Tailwind CSS classes like `bg-primary` and `text-primary-foreground` for styling.

3. **Example UI Enhancement for Pod Resources:**
   ```typescript
   import { useState } from 'react';
   import { Button, Card, Badge, Toast } from '@/components/ui';
   import { Clock, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';
   import { PodResource } from '@/types';

   const PodResourceCard = ({ resource }: { resource: PodResource }) => {
     const [notarizing, setNotarizing] = useState(false);

     const handleNotarize = async () => {
       console.log('Starting notarization for pod resource:', resource.id);
       setNotarizing(true);
       try {
         await notarizePodResource(resource);
         Toast.success('Pod resource notarized successfully!');
       } catch (error) {
         console.error('Notarization failed:', error);
         Toast.error('Failed to notarize pod resource.');
       } finally {
         setNotarizing(false);
       }
     };

     const getStatusBadge = () => {
       if (notarizing) return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Notarizing...</Badge>;
       if (resource.bsv_tx_hash) return <Badge variant="default"><CheckCircle className="w-3 h-3 mr-1" />Notarized</Badge>;
       return <Badge variant="outline">Not Notarized</Badge>;
     };

     return (
       <Card className="bg-primary text-primary-foreground p-4">
         <div className="flex justify-between items-start mb-2">
           <h3 className="font-semibold">{resource.resource_path}</h3>
           {getStatusBadge()}
         </div>
         
         <div className="space-y-2 text-sm">
           <div className="flex justify-between">
             <span>Type:</span>
             <span className="font-mono">{resource.resource_type}</span>
           </div>
           <div className="flex justify-between">
             <span>Status:</span>
             <span className="font-mono">{resource.status}</span>
           </div>
           {resource.bsv_tx_hash && (
             <>
               <div className="flex justify-between">
                 <span>BSV TX:</span>
                 <span className="font-mono text-xs truncate max-w-32">{resource.bsv_tx_hash}</span>
               </div>
               <div className="flex justify-between">
                 <span>Overlay Topic:</span>
                 <span className="font-mono text-xs">{resource.overlay_topic}</span>
               </div>
             </>
           )}
         </div>

         <div className="flex gap-2 mt-4">
           <Button size="sm" variant="secondary">Edit</Button>
           {!resource.bsv_tx_hash ? (
             <Button size="sm" onClick={handleNotarize} disabled={notarizing}>
               {notarizing ? 'Notarizing...' : 'Notarize'}
             </Button>
           ) : (
             <Button size="sm" variant="outline">
               <ExternalLink className="w-3 h-3 mr-1" />
               View on Overlay
             </Button>
           )}
           <Button size="sm" variant="outline">Share</Button>
         </div>
       </Card>
     );
   };
   ```

### Step 2: Implement Pod Resource Notarization Logic

1. **Prepare Pod Resource Data for Notarization:**
   - Hash the pod resource content, metadata, and SOLID pod URL together.
   - Use the @bsv/sdk library for BSV operations and content hashing.
   - Include pod resource path and type in the hash for uniqueness.

2. **Integrate BSV SDK and Overlay:**
   - Use @bsv/sdk for transaction creation and signing.
   - Use @bsv/overlay for publishing to overlay topics.
   - Use @bsv/wallet-toolbox for wallet integration following BRC-100 standard.

3. **Example Pod Notarization Logic:**
   ```typescript
   import { BSV, Transaction, Script } from '@bsv/sdk';
   import { OverlayClient } from '@bsv/overlay';
   import { createSupabaseClient } from '@/utils/supabase/client';
   import { PodResource } from '@/types';

   export const notarizePodResource = async (resource: PodResource) => {
     console.log('Notarizing pod resource:', resource.resource_path);
     
     try {
       // 1. Create content hash including pod URL and resource metadata
       const contentData = {
         resource_path: resource.resource_path,
         resource_type: resource.resource_type,
         pod_url: resource.pod_url,
         content_hash: resource.content_hash,
         timestamp: new Date().toISOString()
       };
       
       const contentHash = BSV.Utils.sha256(JSON.stringify(contentData));
       console.log('Generated content hash for pod resource:', contentHash);

       // 2. Create BSV transaction with content hash
       const transaction = new Transaction();
       const script = Script.fromHex(
         Script.fromString(`OP_RETURN ${contentHash}`).toHex()
       );
       
       transaction.addOutput({
         lockingScript: script,
         satoshis: 0
       });

       // 3. Sign and broadcast transaction (using wallet integration)
       const wallet = await getConnectedWallet(); // BRC-100 wallet
       const signedTx = await wallet.signTransaction(transaction);
       const txHash = await wallet.broadcastTransaction(signedTx);
       
       console.log('BSV transaction created:', txHash);

       // 4. Publish to overlay topic for discovery
       const overlayTopic = `pod_resource_${resource.resource_type}`;
       const overlayClient = new OverlayClient();
       
       await overlayClient.publish({
         topic: overlayTopic,
         data: {
           resource_path: resource.resource_path,
           resource_type: resource.resource_type,
           pod_url: resource.pod_url,
           bsv_tx_hash: txHash,
           content_hash: contentHash,
           notarized_at: new Date().toISOString()
         }
       });
       
       console.log('Published to overlay topic:', overlayTopic);

       // 5. Update Supabase database with notarization details
       const supabase = await createSupabaseClient();
       
       // Update pod_resource record
       const { error: updateError } = await supabase
         .from('pod_resource')
         .update({
           bsv_tx_hash: txHash,
           overlay_topic: overlayTopic,
           status: 'notarized',
           updated_at: new Date().toISOString()
         })
         .eq('id', resource.id);

       if (updateError) {
         console.error('Error updating pod resource:', updateError);
         throw updateError;
       }

       // Create BSV attestation record
       const { error: attestationError } = await supabase
         .from('bsv_attestation')
         .insert({
           resource_id: resource.id,
           attestation_type: 'resource',
           tx_hash: txHash,
           overlay_topic: overlayTopic,
           content_hash: contentHash,
           timestamp_proof: {
             transaction: signedTx,
             overlay_data: contentData
           },
           wallet_address: wallet.address
         });

       if (attestationError) {
         console.error('Error creating BSV attestation:', attestationError);
         throw attestationError;
       }

       // Create overlay sync record
       const { error: syncError } = await supabase
         .from('overlay_sync')
         .insert({
           sync_type: 'resource',
           reference_id: resource.id,
           overlay_topic: overlayTopic,
           tx_hash: txHash,
           sync_status: 'synced',
           sync_data: contentData,
           last_sync_at: new Date().toISOString()
         });

       if (syncError) {
         console.error('Error creating overlay sync record:', syncError);
       }

       console.log('Pod resource notarization completed successfully');
       return { txHash, overlayTopic, contentHash };

     } catch (error) {
       console.error('Pod resource notarization failed:', error);
       throw error;
     }
   };
   ```

### Step 3: Offline Support and Queue Management

1. **Implement Offline Queuing:**
   - Use localStorage or IndexedDB to queue notarization requests when offline.
   - Retry failed notarizations when connectivity is restored.
   - Use Service Worker for background sync if needed.

2. **Example Offline Queue Logic:**
   ```typescript
   import { useState, useEffect } from 'react';

   export const useNotarizationQueue = () => {
     const [pendingNotarizations, setPendingNotarizations] = useState<PodResource[]>([]);

     const queueNotarization = (resource: PodResource) => {
       if (!navigator.onLine) {
         console.log('Offline: queuing notarization for later');
         const queue = JSON.parse(localStorage.getItem('notarization_queue') || '[]');
         queue.push(resource);
         localStorage.setItem('notarization_queue', JSON.stringify(queue));
         setPendingNotarizations(queue);
       } else {
         return notarizePodResource(resource);
       }
     };

     const processPendingNotarizations = async () => {
       const queue = JSON.parse(localStorage.getItem('notarization_queue') || '[]');
       if (queue.length > 0 && navigator.onLine) {
         console.log('Processing pending notarizations:', queue.length);
         for (const resource of queue) {
           try {
             await notarizePodResource(resource);
             queue.shift(); // Remove processed item
           } catch (error) {
             console.error('Failed to process queued notarization:', error);
             break; // Stop processing on error
           }
         }
         localStorage.setItem('notarization_queue', JSON.stringify(queue));
         setPendingNotarizations(queue);
       }
     };

     useEffect(() => {
       window.addEventListener('online', processPendingNotarizations);
       return () => window.removeEventListener('online', processPendingNotarizations);
     }, []);

     return { queueNotarization, pendingNotarizations };
   };
   ```

### Step 4: Overlay Discovery Interface

1. **Create Public Discovery Interface:**
   - Allow users to browse notarized pod resources from overlay topics.
   - Display verification status and access pricing.
   - Link to SOLID pods for paid access.

2. **Example Discovery Component:**
   ```typescript
   import { useState, useEffect } from 'react';
   import { Card, Badge, Button, Input } from '@/components/ui';
   import { Search, ExternalLink } from 'lucide-react';

   const OverlayDiscovery = () => {
     const [discoveredResources, setDiscoveredResources] = useState([]);
     const [searchTopic, setSearchTopic] = useState('');

     const searchOverlay = async (topic: string) => {
       console.log('Searching overlay topic:', topic);
       try {
         const overlayClient = new OverlayClient();
         const results = await overlayClient.search({ topic });
         setDiscoveredResources(results);
         console.log('Found resources on overlay:', results.length);
       } catch (error) {
         console.error('Overlay search failed:', error);
       }
     };

     return (
       <div className="space-y-4">
         <div className="flex gap-2">
           <Input
             placeholder="Search overlay topic (e.g., pod_resource_note)"
             value={searchTopic}
             onChange={(e) => setSearchTopic(e.target.value)}
           />
           <Button onClick={() => searchOverlay(searchTopic)}>
             <Search className="w-4 h-4 mr-2" />
             Search
           </Button>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
           {discoveredResources.map((resource, index) => (
             <Card key={index} className="p-4">
               <div className="flex justify-between items-start mb-2">
                 <h3 className="font-semibold">{resource.resource_path}</h3>
                 <Badge variant="default">Verified</Badge>
               </div>
               
               <div className="space-y-1 text-sm">
                 <div>Type: {resource.resource_type}</div>
                 <div>Pod: {resource.pod_url}</div>
                 <div className="font-mono text-xs">
                   TX: {resource.bsv_tx_hash?.substring(0, 16)}...
                 </div>
               </div>

               <div className="flex gap-2 mt-4">
                 <Button size="sm" variant="outline">
                   <ExternalLink className="w-3 h-3 mr-1" />
                   View Details
                 </Button>
                 <Button size="sm">
                   Access (100 sats)
                 </Button>
               </div>
             </Card>
           ))}
         </div>
       </div>
     );
   };
   ```

### Step 5: Debug Logging and Error Handling

1. **Comprehensive Debug Logging:**
   - Log all stages of the notarization process.
   - Include timing information for performance monitoring.
   - Track overlay sync status and errors.

2. **Example Debug Implementation:**
   ```typescript
   const debugNotarization = {
     start: (resourceId: string) => {
       console.log(`[NOTARIZATION START] Resource ID: ${resourceId}`);
       console.time(`notarization-${resourceId}`);
     },
     
     contentHash: (hash: string) => {
       console.log(`[CONTENT HASH] Generated: ${hash}`);
     },
     
     bsvTransaction: (txHash: string) => {
       console.log(`[BSV TRANSACTION] Created: ${txHash}`);
     },
     
     overlayPublish: (topic: string, txHash: string) => {
       console.log(`[OVERLAY PUBLISH] Topic: ${topic}, TX: ${txHash}`);
     },
     
     databaseUpdate: (resourceId: string) => {
       console.log(`[DATABASE UPDATE] Resource ID: ${resourceId} updated`);
     },
     
     complete: (resourceId: string) => {
       console.timeEnd(`notarization-${resourceId}`);
       console.log(`[NOTARIZATION COMPLETE] Resource ID: ${resourceId}`);
     },
     
     error: (resourceId: string, error: any) => {
       console.error(`[NOTARIZATION ERROR] Resource ID: ${resourceId}`, error);
     }
   };
   ```

### Summary

This implementation provides:

- **Pod-Centric Notarization**: Direct integration with SOLID pod management dashboard
- **BSV Blockchain Integration**: Using @bsv/sdk for transaction creation and timestamping
- **Overlay Discovery**: Publishing to BSV overlay topics for public resource discovery
- **Offline Support**: Queue management for notarizations when offline
- **Complete Audit Trail**: Full tracking in Supabase with BSV attestation records
- **User-Friendly UI**: Clear status indicators and responsive design using shadcn/ui
- **Error Handling**: Comprehensive logging and graceful error recovery

The feature ensures that users can maintain their pod-centric data sovereignty while leveraging BSV blockchain for immutable timestamping and public discovery of their resources, creating a bridge between private data control and public verifiability.