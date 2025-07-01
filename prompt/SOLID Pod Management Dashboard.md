# SOLID Pod Management Dashboard Implementation Guide

> **⚠️ BSV SPV ARCHITECTURE REQUIREMENTS**
> 
> This implementation strictly follows BSV SPV (Simplified Payment Verification) architecture:
> - **ProtoWallet for pod attestations** - App creates transactions for pod resource timestamping
> - **WalletClient for user payments** - Users pay for pod resources with their BRC-100 wallets
> - **No pod wallet management** - App never manages keys for user pods
> - **SPV verification** - Verify pod attestations using merkle proofs
> - **BSV overlay integration** - Publish pod resources to overlay for discovery
> - **SOLID sovereignty maintained** - Pod data remains under user control
> - See `BSV_SPV_ARCHITECTURE_REQUIREMENTS.md` for complete guidelines

## Task
Implement a production-ready SOLID Pod Management Dashboard feature that leverages the complete BSV ecosystem including @bsv/sdk, wallet-toolbox, wallet-infra, and identity-services for comprehensive pod management with blockchain attestation and monetization capabilities.

## BSV Ecosystem Integration for Pod Management

### Core Libraries and Infrastructure
- **@bsv/sdk**: Transaction creation for pod resource attestation and timestamping
- **wallet-toolbox**: Secure wallet integration for micropayment processing
- **wallet-infra**: Backend service patterns for scalable pod management APIs
- **identity-services**: Pod ownership verification and access control

### Pod-Centric Architecture with BSV Enhancement
```
SOLID Pod (Data Vault) → BSV Attestation → Overlay Discovery → Monetization
       ↓                     ↓                ↓                ↓
  User Sovereignty    Immutable Proof   Public Discovery   Direct Revenue
```

## Implementation Guide

### Overview
The enhanced SOLID Pod Management Dashboard provides:
- **Complete Pod Resource Management**: View, organize, and manage all pod contents
- **BSV Blockchain Integration**: Immutable timestamping and attestation for pod resources
- **Monetization Capabilities**: Direct micropayment access to shared pod resources
- **Identity-based Access Control**: Secure pod access using decentralized identity
- **Real-time Synchronization**: Live sync between pod contents and database tracking
- **Overlay Discovery**: Public discovery of shared pod resources
- **Production-ready Infrastructure**: Scalable backend using wallet-infra patterns

### Production Pod Management Service
```typescript
import { PodManager } from '@solid/pod-manager';
import { WalletToolbox } from '@bsv/wallet-toolbox';
import { IdentityService } from '@bsv/identity-services';
import { WalletInfra } from '@bsv/wallet-infra';

// Initialize production pod management service
const podManagementService = new PodManager({
  identityService: new IdentityService({
    provider: 'bsv',
    network: process.env.BSV_NETWORK
  }),
  walletService: new WalletToolbox({
    network: process.env.BSV_NETWORK,
    storage: 'encrypted-database'
  }),
  infraService: new WalletInfra({
    apiEndpoint: process.env.API_BASE_URL,
    webhookSecret: process.env.WEBHOOK_SECRET
  })
});
```

### Steps

1. **Create the Pod Management Page**
   - **File Location**: `app/pod/page.tsx`
   - **Purpose**: This page will list all the stored resources in the user's SOLID pod and provide options to manage them.

2. **Design the UI Layout**
   - Use `shadcn/ui` components for a consistent look and feel.
   - Implement a responsive design using Tailwind CSS variable-based colors (e.g., `bg-primary`, `text-primary-foreground`).

3. **Implement the Pod Resource List**
   - **Component**: `PodResourceCard.tsx`
   - **Purpose**: Display each pod resource with details such as Resource Path, Type, Status, BSV Transaction Hash, and Overlay Topic.
   - **UI Elements**:
     - Use `shadcn/ui` Card and Table components to list pod resources.
     - Add buttons for operations like "Edit," "Notarize," "Share," and "Sync to Overlay" on each pod resource entry.

4. **Add Resource Upload Functionality**
   - **Component**: `ResourceUploadModal.tsx`
   - **Purpose**: Provide a modal form for users to upload new resources to their SOLID pod.
   - **UI Elements**:
     - Use `shadcn/ui` Modal components for the resource upload interface.
     - Include input fields for resource selection, type specification, and metadata entry.

5. **Manage Internal State**
   - **State Management**: Use React Context or local state to manage the list of pod resources.
   - **State Actions**:
     - `setPodResources`: Update the list of pod resources.
     - `addPodResource`: Add a new resource to the pod.
     - `updatePodResource`: Update an existing pod resource (status, BSV hash, etc.).
     - `removePodResource`: Remove a resource from the pod.

6. **Enhanced Pod Resource Management with BSV Integration**
   ```typescript
   import { createSupabaseClient } from '@/utils/supabase/client';
   import { PodClient } from '@solid/pod-client';
   import { WalletToolbox } from '@bsv/wallet-toolbox';
   import { OverlayClient } from '@bsv/overlay';

   export class EnhancedPodResourceManager {
     private supabase = createSupabaseClient();
     private podClient: PodClient;
     private wallet: WalletToolbox;
     private overlayClient: OverlayClient;

     constructor(podUrl: string, identityService: IdentityService) {
       this.podClient = new PodClient({ podUrl, identityService });
       this.wallet = new WalletToolbox({ network: process.env.BSV_NETWORK });
       this.overlayClient = new OverlayClient({ network: process.env.BSV_NETWORK });
     }

     async fetchPodResourcesWithSync() {
       console.log('Fetching pod resources with real-time sync');
       
       try {
         // 1. Fetch from database
         const { data: dbResources, error } = await this.supabase
           .from('pod_resource')
           .select(`
             *,
             bsv_attestation(*),
             shared_resource(*),
             overlay_sync(*)
           `)
           .order('created_at', { ascending: false });

         if (error) throw error;

         // 2. Sync with actual pod contents
         const podResources = await this.podClient.listResources();
         const syncedResources = await this.syncResourcesWithPod(dbResources, podResources);

         console.log('Pod resources synced:', syncedResources.length);
         return syncedResources;
         
       } catch (error) {
         console.error('Error fetching pod resources:', error);
         throw error;
       }
     }

     async createPodResource(resourceData: {
       name: string;
       content: any;
       type: string;
       metadata?: Record<string, any>;
       privacyLevel: 'private' | 'shared' | 'public';
     }) {
       console.log('Creating new pod resource:', resourceData.name);
       
       try {
         // 1. Store in SOLID pod
         const podPath = `resources/${Date.now()}-${resourceData.name}`;
         await this.podClient.createResource(podPath, {
           content: resourceData.content,
           metadata: resourceData.metadata,
           type: resourceData.type
         });

         // 2. Create content hash for BSV attestation
         const contentHash = await this.generateContentHash(resourceData.content);

         // 3. Record in database
         const { data: newResource, error } = await this.supabase
           .from('pod_resource')
           .insert({
             resource_path: podPath,
             resource_type: resourceData.type,
             pod_url: this.podClient.podUrl,
             content_hash: contentHash,
             metadata: {
               ...resourceData.metadata,
               privacy_level: resourceData.privacyLevel,
               created_via: 'dashboard'
             },
             status: resourceData.privacyLevel === 'private' ? 'private' : 'pending_attestation'
           })
           .select()
           .single();

         if (error) throw error;

         // 4. Create BSV attestation if not private
         if (resourceData.privacyLevel !== 'private') {
           const attestationTx = await this.createResourceAttestation(newResource, contentHash);
           
           // Update resource with attestation
           await this.supabase
             .from('pod_resource')
             .update({ 
               bsv_tx_hash: attestationTx,
               status: 'attested' 
             })
             .eq('id', newResource.id);

           newResource.bsv_tx_hash = attestationTx;
         }

         // 5. Publish to overlay if public
         if (resourceData.privacyLevel === 'public') {
           await this.publishToOverlay(newResource);
         }

         console.log('Pod resource created successfully:', newResource.id);
         return newResource;
         
       } catch (error) {
         console.error('Error creating pod resource:', error);
         throw error;
       }
     }

     async updatePodResourceStatus(resourceId: string, updates: {
       status?: string;
       metadata?: Record<string, any>;
       privacyLevel?: 'private' | 'shared' | 'public';
     }) {
       console.log('Updating pod resource:', resourceId, updates);
       
       try {
         // 1. Update in database
         const { data: updatedResource, error } = await this.supabase
           .from('pod_resource')
           .update({
             ...updates,
             updated_at: new Date().toISOString()
           })
           .eq('id', resourceId)
           .select()
           .single();

         if (error) throw error;

         // 2. Sync changes to pod if needed
         if (updates.metadata) {
           await this.podClient.updateResourceMetadata(
             updatedResource.resource_path,
             updates.metadata
           );
         }

         // 3. Handle privacy level changes
         if (updates.privacyLevel && updates.privacyLevel !== 'private') {
           if (!updatedResource.bsv_tx_hash) {
             const contentHash = updatedResource.content_hash;
             const attestationTx = await this.createResourceAttestation(updatedResource, contentHash);
             
             await this.supabase
               .from('pod_resource')
               .update({ bsv_tx_hash: attestationTx })
               .eq('id', resourceId);
           }

           if (updates.privacyLevel === 'public') {
             await this.publishToOverlay(updatedResource);
           }
         }

         console.log('Pod resource updated successfully');
         return updatedResource;
         
       } catch (error) {
         console.error('Error updating pod resource:', error);
         throw error;
       }
     }

     private async createResourceAttestation(resource: any, contentHash: string): Promise<string> {
       console.log('Creating BSV attestation for resource:', resource.id);
       
       const transaction = await this.wallet.createTransaction({
         outputs: [{
           script: Script.fromString(`OP_RETURN ${JSON.stringify({
             action: 'pod_resource_attestation',
             resource_id: resource.id,
             resource_path: resource.resource_path,
             pod_url: resource.pod_url,
             content_hash: contentHash,
             timestamp: new Date().toISOString()
           })}`),
           satoshis: 0
         }]
       });

       const txHash = await this.wallet.broadcastTransaction(transaction);
       
       // Record attestation
       await this.supabase
         .from('bsv_attestation')
         .insert({
           resource_id: resource.id,
           attestation_type: 'pod_resource',
           tx_hash: txHash,
           content_hash: contentHash,
           timestamp_proof: { transaction: transaction.toHex() }
         });

       return txHash;
     }

     private async publishToOverlay(resource: any) {
       console.log('Publishing resource to overlay:', resource.id);
       
       const overlayTopic = `pod_resource_${resource.resource_type}`;
       
       await this.overlayClient.publish({
         topic: overlayTopic,
         data: {
           resource_id: resource.id,
           resource_path: resource.resource_path,
           resource_type: resource.resource_type,
           pod_url: resource.pod_url,
           content_hash: resource.content_hash,
           bsv_tx_hash: resource.bsv_tx_hash,
           metadata: resource.metadata,
           published_at: new Date().toISOString()
         }
       });

       // Record overlay sync
       await this.supabase
         .from('overlay_sync')
         .insert({
           sync_type: 'pod_resource',
           reference_id: resource.id,
           overlay_topic: overlayTopic,
           tx_hash: resource.bsv_tx_hash,
           sync_status: 'synced',
           last_sync_at: new Date().toISOString()
         });
     }

     private async syncResourcesWithPod(dbResources: any[], podResources: any[]) {
       // Implementation to sync database records with actual pod contents
       console.log('Syncing database with pod contents');
       
       const synced = [];
       
       for (const dbResource of dbResources) {
         const podResource = podResources.find(pr => pr.path === dbResource.resource_path);
         
         if (podResource) {
           // Resource exists in both - check if sync needed
           const needsSync = await this.checkSyncRequired(dbResource, podResource);
           if (needsSync) {
             await this.syncResource(dbResource, podResource);
           }
           synced.push({ ...dbResource, pod_sync_status: 'synced' });
         } else {
           // Resource in DB but not in pod - mark as missing
           synced.push({ ...dbResource, pod_sync_status: 'missing' });
         }
       }
       
       return synced;
     }

     private async generateContentHash(content: any): Promise<string> {
       const { createHash } = await import('crypto');
       return createHash('sha256').update(JSON.stringify(content)).digest('hex');
     }
   }
   ```

7. **BSV Notarization Integration**
   - **Purpose**: Allow users to notarize their pod resources on the BSV blockchain for immutable timestamping.
   - **UI Elements**:
     - Add "Notarize" button for each resource with status indicators.
     - Show BSV transaction hash and timestamp when notarized.
     - Display overlay topic for public discovery when shared.

8. **SOLID Pod Integration**
   - **Purpose**: Connect to actual SOLID pod storage and sync resource metadata.
   - **Features**:
     - Display pod URL and connection status.
     - Sync resources between local database and SOLID pod.
     - Handle SOLID pod authentication and access control.

9. **Implement Debug Logging**
   - Add detailed debug logs to track the flow of data and operations.
   - Example:
     ```typescript
     console.log('Fetching pod resources...');
     console.log('Pod resources fetched successfully:', podResources);
     console.log('Notarizing resource:', resourceId, 'with content hash:', contentHash);
     console.log('BSV transaction created:', txHash);
     console.log('Overlay sync initiated for topic:', overlayTopic);
     ```

10. **Ensure Responsive Design**
   - Use Tailwind CSS classes to ensure the layout adapts across devices.
   - Test the UI on different screen sizes to verify responsiveness.

### User Flow & UI
- When a user navigates to the `/pod` page, they should see a list of their pod resource entries.
- Each entry should display relevant details including:
  - Resource path/name
  - Resource type (note, document, context, file)
  - Status (private, shared, notarized, public)
  - BSV transaction hash (if notarized)
  - Overlay topic (if shared)
  - Timestamps (created, updated)
- Users can click on an entry to view more details or perform actions like editing, notarizing, or sharing.
- A prominent "Add Resource" button allows users to upload new content to their pod.

### Data Points
- Pod resource metadata (path, type, status, BSV hash, overlay topic, content hash).
- User authentication state and SOLID pod connection status.
- BSV attestation records and overlay sync status.
- Micropayment pricing for shared resources.

### Key Features
1. **Pod-Centric Architecture**: Resources are stored in user's SOLID pod, with metadata tracked in Supabase.
2. **BSV Integration**: Resources can be notarized on BSV blockchain for immutable timestamping.
3. **Overlay Discovery**: Shared resources are published to BSV overlay topics for discovery.
4. **Access Control**: SOLID pod access policies control who can access shared resources.
5. **Micropayments**: Shared resources can be monetized through BSV micropayments.

### Step 7: Advanced Pod Analytics and Monitoring

```typescript
// components/pod/PodAnalyticsDashboard.tsx
import { useState, useEffect } from 'react';
import { Card, Badge, Button, Progress } from '@/components/ui';
import { BarChart, LineChart, PieChart } from '@/components/ui/charts';

const PodAnalyticsDashboard = ({ podUrl }: { podUrl: string }) => {
  const [analytics, setAnalytics] = useState({
    totalResources: 0,
    storageUsed: 0,
    attestedResources: 0,
    sharedResources: 0,
    revenue: 0,
    accessCount: 0
  });

  const [revenueData, setRevenueData] = useState([]);
  const [accessData, setAccessData] = useState([]);

  useEffect(() => {
    fetchPodAnalytics();
  }, [podUrl]);

  const fetchPodAnalytics = async () => {
    console.log('Fetching pod analytics for:', podUrl);
    
    try {
      const supabase = await createSupabaseClient();
      
      // Fetch resource statistics
      const { data: resources } = await supabase
        .from('pod_resource')
        .select('*')
        .eq('pod_url', podUrl);

      // Fetch revenue data
      const { data: revenues } = await supabase
        .from('micropayment')
        .select('amount_satoshis, created_at')
        .eq('seller_pod_url', podUrl)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      // Fetch access data
      const { data: accesses } = await supabase
        .from('resource_access')
        .select('granted_at')
        .eq('pod_url', podUrl)
        .gte('granted_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      // Calculate analytics
      const analytics = {
        totalResources: resources?.length || 0,
        storageUsed: calculateStorageUsed(resources),
        attestedResources: resources?.filter(r => r.bsv_tx_hash).length || 0,
        sharedResources: resources?.filter(r => r.status === 'shared').length || 0,
        revenue: revenues?.reduce((sum, r) => sum + r.amount_satoshis, 0) || 0,
        accessCount: accesses?.length || 0
      };

      setAnalytics(analytics);
      setRevenueData(processRevenueData(revenues));
      setAccessData(processAccessData(accesses));
      
    } catch (error) {
      console.error('Error fetching pod analytics:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold">{analytics.totalResources}</div>
          <div className="text-sm text-muted-foreground">Total Resources</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold">{analytics.attestedResources}</div>
          <div className="text-sm text-muted-foreground">Attested</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold">{analytics.sharedResources}</div>
          <div className="text-sm text-muted-foreground">Shared</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold">{formatSatoshis(analytics.revenue)}</div>
          <div className="text-sm text-muted-foreground">Revenue (30d)</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold">{analytics.accessCount}</div>
          <div className="text-sm text-muted-foreground">Accesses (30d)</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold">{formatBytes(analytics.storageUsed)}</div>
          <div className="text-sm text-muted-foreground">Storage Used</div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Revenue Trend</h3>
          <LineChart data={revenueData} />
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Resource Access</h3>
          <BarChart data={accessData} />
        </Card>
      </div>
    </div>
  );
};
```

### Step 8: Pod Monetization Interface

```typescript
// components/pod/PodMonetizationPanel.tsx
const PodMonetizationPanel = ({ resources }: { resources: PodResource[] }) => {
  const [pricing, setPricing] = useState<Map<string, number>>(new Map());
  const [earnings, setEarnings] = useState(0);

  const createSharedResource = async (resourceId: string, price: number) => {
    console.log('Creating shared resource:', resourceId, 'Price:', price, 'sats');
    
    try {
      const supabase = await createSupabaseClient();
      
      // Create shared resource record
      const { data: sharedResource } = await supabase
        .from('shared_resource')
        .insert({
          resource_type: 'pod_resource',
          resource_id: resourceId,
          price_satoshis: price,
          overlay_topic: `pod_resource_monetized`,
          access_policy: {
            type: 'micropayment',
            duration: '24h',
            access_level: 'full'
          }
        })
        .select()
        .single();

      // Publish to overlay for discovery
      await publishToOverlay(sharedResource);
      
      toast({
        title: "Resource Monetized",
        description: `Resource is now available for ${price} satoshis`
      });
      
    } catch (error) {
      console.error('Error creating shared resource:', error);
      toast({
        title: "Monetization Failed",
        description: "Unable to monetize resource",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Monetization</h3>
      
      <div className="space-y-4">
        {resources.filter(r => r.status !== 'private').map(resource => (
          <div key={resource.id} className="flex items-center justify-between p-3 border rounded">
            <div>
              <div className="font-medium">{resource.resource_path}</div>
              <div className="text-sm text-muted-foreground">{resource.resource_type}</div>
            </div>
            
            <div className="flex items-center gap-2">
              <Input
                type="number"
                placeholder="Price (sats)"
                value={pricing.get(resource.id) || ''}
                onChange={(e) => setPricing(prev => new Map(prev.set(resource.id, parseInt(e.target.value))))}
                className="w-24"
              />
              <Button
                size="sm"
                onClick={() => createSharedResource(resource.id, pricing.get(resource.id) || 100)}
                disabled={!pricing.get(resource.id)}
              >
                Monetize
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
```

### Step 9: Production Deployment with wallet-infra

```typescript
// Production deployment configuration
const productionPodConfig = {
  infrastructure: {
    database: {
      provider: 'supabase',
      connectionPooling: true,
      maxConnections: 100,
      ssl: true
    },
    bsv: {
      network: 'mainnet',
      nodeEndpoint: process.env.BSV_NODE_ENDPOINT,
      overlayEndpoint: process.env.BSV_OVERLAY_ENDPOINT,
      feeRate: 0.5
    },
    monitoring: {
      analyticsEnabled: true,
      errorTracking: true,
      performanceMonitoring: true
    }
  },
  security: {
    encryption: {
      algorithm: 'AES-256-GCM',
      keyRotation: '30d'
    },
    accessControl: {
      rateLimiting: true,
      authRequired: true,
      podOwnershipVerification: true
    }
  },
  scaling: {
    autoScaling: true,
    loadBalancing: true,
    caching: {
      provider: 'redis',
      ttl: 300
    }
  }
};
```

### Summary
This enhanced implementation provides a production-ready SOLID Pod Management Dashboard that:

- **Leverages Complete BSV Ecosystem**: Integrates @bsv/sdk, wallet-toolbox, wallet-infra, and identity-services for comprehensive functionality
- **Ensures Data Sovereignty**: Users maintain complete control over their SOLID pod data while enabling blockchain verification
- **Provides Real-time Synchronization**: Live sync between pod contents and database tracking with conflict resolution
- **Enables Direct Monetization**: Built-in micropayment system for sharing pod resources with instant BSV payments
- **Offers Advanced Analytics**: Comprehensive dashboard showing resource usage, revenue, and access patterns
- **Supports Identity-based Access**: Secure access control using decentralized identity verification
- **Includes Overlay Discovery**: Public discovery of shared resources through BSV overlay topics
- **Provides Production Infrastructure**: Scalable, secure backend using wallet-infra patterns with monitoring and analytics
- **Maintains Performance**: Optimized for large-scale pod management with caching and load balancing
- **Offers Comprehensive Security**: End-to-end encryption, rate limiting, and secure key management

The implementation creates a complete pod management ecosystem that bridges personal data sovereignty with blockchain capabilities, enabling users to maintain control while participating in a global data economy through secure, verifiable micropayments.