# Feature Implementation Guide: Sharing & Pay-per-Use Access to Context Store

> **⚠️ BSV SPV ARCHITECTURE REQUIREMENTS**
> 
> This implementation strictly follows BSV SPV (Simplified Payment Verification) architecture:
> - **ProtoWallet for app receipts** - App creates transaction templates for payments
> - **WalletClient for user payments** - Users pay with their own BRC-100 wallets
> - **No user wallet creation** - Users bring existing BRC-100 compatible wallets
> - **SPV payment verification** - Verify payments using merkle proofs
> - **BSV overlay discovery** - Publish shared resources to overlay topics
> - **BRC-100 standard only** - All user wallet interactions follow BRC-100
> - See `BSV_SPV_ARCHITECTURE_REQUIREMENTS.md` for complete guidelines

## Task Overview
Implement a production-ready feature that allows users to share access to their personal context store or pod resources with other users for a fee on a pay-per-use basis via BSV micropayments. This feature leverages the complete BSV ecosystem including @bsv/sdk, wallet-toolbox, wallet-infra, and identity-services for a robust, scalable solution.

## BSV Ecosystem Integration

### Core Libraries Used
- **@bsv/sdk**: Transaction creation, signing, and broadcasting
- **wallet-toolbox**: Production wallet integration (BRC-100 standard)
- **wallet-infra**: Backend service patterns and API design
- **identity-services**: User identity verification and access control

### Architecture Overview
```
SOLID Pod (User Data) → BSV Attestation → Overlay Discovery → Micropayment Access
     ↓                      ↓                ↓                 ↓
  Private Storage      Immutable Proof   Public Listing    Direct Payment
```

## Implementation Steps

### Step 1: Database Schema
Ensure the database schema includes the necessary tables and fields for sharing and micropayment functionality.

- **Table: `share_item`**
  - `id`: Primary key
  - `item_type`: Type of item ('vault' or 'context')
  - `item_id`: ID from `vault_item` or `context_entry`
  - `price`: Micropayment price per access/view
  - `access_status`: Status of access (e.g., 'pending', 'paid', 'granted')
  - `payment_receipt`: Receipt/payment confirmation details
  - `created_at`: Timestamp
  - `user_id`: User ID

### Step 2: UI Components
Create and update UI components to support sharing and micropayment functionality.

1. **SharingSettings.tsx**
   - **Location**: `components/app/SharingSettings.tsx`
   - **Purpose**: Component to configure sharing settings, including toggling sharing and setting a price.
   - **UI Elements**:
     - Toggle switch for enabling/disabling sharing.
     - Input field for setting the micropayment price.
     - Display of access logs or history.
   - **Styling**: Use Tailwind classes like `bg-primary`, `text-primary-foreground`.

2. **Sharing Page**
   - **Location**: `app/app/sharing/page.tsx`
   - **Purpose**: Page to manage sharing settings and view shared items.
   - **UI Elements**:
     - List of shared items with their current status.
     - Button to configure sharing settings for each item.
   - **Styling**: Ensure responsive design using Tailwind's variable-based classes.

### Step 3: State Management
Define and manage the state for sharing and micropayment functionality.

1. **ShareState Interface**
   - **Location**: `types/`
   - **Purpose**: Interface to manage the state of shared items.
   - **Fields**:
     - `shareItems`: Array of `ShareItem`.
     - `addShareItem`: Function to add a new share item.
     - `updateShareItem`: Function to update an existing share item.
     - `removeShareItem`: Function to remove a share item.

2. **State Management Implementation**
   - Use React Context or local state within the `SharingSettings` component to manage the state of shared items.
   - Ensure state updates immediately reflect in the UI.

### Step 4: BSV Micropayment Integration
Implement production-ready micropayment functionality using the wallet-toolbox and @bsv/sdk.

1. **Wallet Integration Setup**
   ```typescript
   import { WalletToolbox, WalletClient, ProtoWallet } from '@bsv/wallet-toolbox';
   import { Transaction, Script } from '@bsv/sdk';
   import { IdentityService } from '@bsv/identity-services';

   // Connect to user's existing BRC-100 wallet
   const connectUserWallet = async () => {
     const userWallet = await WalletClient.connect({
       standard: 'BRC-100',
       permissions: ['sign-transaction', 'get-address'],
       requestUserConsent: true
     });
     
     return userWallet;
   };
   
   // App's ProtoWallet for transaction construction and fees
   const initializeAppWallet = async () => {
     const appWallet = new ProtoWallet({
       network: 'mainnet',
       storage: 'encrypted-database'
     });
     
     return appWallet;
   };
   ```

2. **Micropayment Transaction Flow**
   ```typescript
   import { createSupabaseClient } from '@/utils/supabase/client';
   import { toast } from '@/components/ui/use-toast';

   const processMicropayment = async (sharedResource: SharedResource) => {
     console.log('Processing micropayment for resource:', sharedResource.id);
     
     try {
       // 1. Connect to user's BRC-100 wallet
       const userWallet = await connectUserWallet();
       console.log('User wallet connected:', userWallet.address);
       
       // 2. App creates transaction template using ProtoWallet
       const appWallet = await initializeAppWallet();
       const transaction = await appWallet.createTransaction({
       
       // Add payment output to resource owner
       transaction.addOutput({
         lockingScript: Script.fromAddress(sharedResource.owner_address),
         satoshis: sharedResource.price_satoshis
       });

       // Add data output with access proof
       const accessProof = {
         resource_id: sharedResource.id,
         buyer_address: wallet.address,
         timestamp: new Date().toISOString(),
         access_level: 'full'
       };
       
       const dataScript = Script.fromString(
         `OP_RETURN ${JSON.stringify(accessProof)}`
       );
       
       transaction.addOutput({
         lockingScript: dataScript,
         satoshis: 0
       });

       // 3. Sign and broadcast transaction
       const signedTx = await wallet.signTransaction(transaction);
       const txHash = await wallet.broadcastTransaction(signedTx);
       
       console.log('Payment transaction broadcasted:', txHash);

       // 4. Record payment in database
       const supabase = await createSupabaseClient();
       const { data: paymentRecord } = await supabase
         .from('micropayment')
         .insert({
           shared_resource_id: sharedResource.id,
           buyer_address: wallet.address,
           tx_hash: txHash,
           amount_satoshis: sharedResource.price_satoshis,
           status: 'confirmed',
           access_granted_at: new Date().toISOString()
         })
         .select()
         .single();

       // 5. Grant access to resource
       await grantResourceAccess(sharedResource.id, wallet.address, txHash);
       
       toast({
         title: "Access Granted",
         description: `Payment of ${sharedResource.price_satoshis} satoshis confirmed`
       });

       return { success: true, txHash, paymentRecord };
       
     } catch (error) {
       console.error('Micropayment failed:', error);
       toast({
         title: "Payment Failed",
         description: "Unable to process payment. Please try again.",
         variant: "destructive"
       });
       throw error;
     }
   };
   ```

3. **Access Control Implementation**
   ```typescript
   const grantResourceAccess = async (resourceId: string, buyerAddress: string, txHash: string) => {
     console.log('Granting access to resource:', resourceId, 'for buyer:', buyerAddress);
     
     const supabase = await createSupabaseClient();
     
     // Create access token for the buyer
     const accessToken = generateSecureAccessToken({
       resource_id: resourceId,
       buyer_address: buyerAddress,
       tx_hash: txHash,
       expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
     });

     // Record access grant
     await supabase
       .from('resource_access')
       .insert({
         shared_resource_id: resourceId,
         buyer_address: buyerAddress,
         access_token: accessToken,
         tx_hash: txHash,
         granted_at: new Date().toISOString(),
         expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
       });

     console.log('Access granted and recorded');
     return accessToken;
   };
   ```

4. **Real-time Payment Verification**
   ```typescript
   import { useEffect, useState } from 'react';
   import { WebSocket } from 'ws';

   const usePaymentVerification = (txHash: string) => {
     const [status, setStatus] = useState<'pending' | 'confirmed' | 'failed'>('pending');

     useEffect(() => {
       if (!txHash) return;

       // Monitor blockchain for transaction confirmation
       const monitorTransaction = async () => {
         try {
           const wallet = await initializeWallet();
           const txStatus = await wallet.getTransactionStatus(txHash);
           
           if (txStatus.confirmed) {
             setStatus('confirmed');
             console.log('Payment confirmed on blockchain:', txHash);
           } else if (txStatus.failed) {
             setStatus('failed');
             console.log('Payment failed:', txHash);
           }
         } catch (error) {
           console.error('Error monitoring transaction:', error);
           setStatus('failed');
         }
       };

       const interval = setInterval(monitorTransaction, 5000); // Check every 5 seconds
       return () => clearInterval(interval);
     }, [txHash]);

     return status;
   };
   ```

5. **Enhanced UI with Payment Status**
   ```typescript
   const PaymentButton = ({ sharedResource }: { sharedResource: SharedResource }) => {
     const [paying, setPaying] = useState(false);
     const [txHash, setTxHash] = useState<string | null>(null);
     const paymentStatus = usePaymentVerification(txHash);

     const handlePayment = async () => {
       setPaying(true);
       try {
         const result = await processMicropayment(sharedResource);
         setTxHash(result.txHash);
       } catch (error) {
         console.error('Payment failed:', error);
       } finally {
         setPaying(false);
       }
     };

     if (paymentStatus === 'confirmed') {
       return (
         <Button variant="default" disabled>
           <CheckCircle className="w-4 h-4 mr-2" />
           Access Granted
         </Button>
       );
     }

     return (
       <Button 
         onClick={handlePayment} 
         disabled={paying || paymentStatus === 'pending'}
         className="bg-primary hover:bg-primary/90"
       >
         {paying ? (
           <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Processing...</>
         ) : paymentStatus === 'pending' ? (
           <><Clock className="w-4 h-4 mr-2" />Confirming...</>
         ) : (
           <><CreditCard className="w-4 h-4 mr-2" />Pay {sharedResource.price_satoshis} sats</>
         )}
       </Button>
     );
   };
   ```

### Step 5: Backend Integration with wallet-infra Patterns
Implement production-ready backend services following wallet-infra architectural patterns.

1. **API Routes Architecture**
   ```typescript
   // app/api/micropayments/route.ts
   import { NextRequest, NextResponse } from 'next/server';
   import { WalletInfra } from '@bsv/wallet-infra';
   import { createSupabaseClient } from '@/utils/supabase/server';

   export async function POST(request: NextRequest) {
     console.log('Processing micropayment API request');
     
     try {
       const { resourceId, buyerAddress, txHash } = await request.json();
       
       // Validate transaction on blockchain
       const walletInfra = new WalletInfra({
         network: process.env.BSV_NETWORK || 'mainnet',
         apiKey: process.env.BSV_API_KEY
       });
       
       const txValid = await walletInfra.validateTransaction(txHash);
       if (!txValid) {
         return NextResponse.json(
           { error: 'Invalid transaction' },
           { status: 400 }
         );
       }

       // Process payment and grant access
       const supabase = createSupabaseClient();
       const result = await processPaymentAndGrantAccess({
         resourceId,
         buyerAddress,
         txHash,
         supabase
       });

       return NextResponse.json({ success: true, ...result });
       
     } catch (error) {
       console.error('Micropayment API error:', error);
       return NextResponse.json(
         { error: 'Payment processing failed' },
         { status: 500 }
       );
     }
   }
   ```

2. **Webhook Integration for Real-time Updates**
   ```typescript
   // app/api/webhooks/bsv-transaction/route.ts
   import { NextRequest, NextResponse } from 'next/server';
   import { verifyWebhookSignature } from '@bsv/wallet-infra';

   export async function POST(request: NextRequest) {
     const body = await request.text();
     const signature = request.headers.get('x-bsv-signature');
     
     // Verify webhook authenticity
     if (!verifyWebhookSignature(body, signature, process.env.BSV_WEBHOOK_SECRET)) {
       return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
     }

     const event = JSON.parse(body);
     console.log('Received BSV transaction webhook:', event);

     if (event.type === 'transaction.confirmed') {
       await handleTransactionConfirmation(event.data);
     }

     return NextResponse.json({ received: true });
   }
   ```

3. **Enhanced Database Schema**
   ```sql
   -- Enhanced micropayment table
   CREATE TABLE micropayment (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     shared_resource_id UUID REFERENCES shared_resource(id),
     buyer_address VARCHAR(64) NOT NULL,
     seller_address VARCHAR(64) NOT NULL,
     tx_hash VARCHAR(64) UNIQUE NOT NULL,
     amount_satoshis BIGINT NOT NULL,
     status VARCHAR(20) DEFAULT 'pending',
     confirmations INTEGER DEFAULT 0,
     access_granted_at TIMESTAMP,
     expires_at TIMESTAMP,
     created_at TIMESTAMP DEFAULT NOW(),
     updated_at TIMESTAMP DEFAULT NOW()
   );

   -- Resource access tracking
   CREATE TABLE resource_access (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     shared_resource_id UUID REFERENCES shared_resource(id),
     buyer_address VARCHAR(64) NOT NULL,
     access_token TEXT NOT NULL,
     tx_hash VARCHAR(64),
     granted_at TIMESTAMP DEFAULT NOW(),
     expires_at TIMESTAMP,
     access_count INTEGER DEFAULT 0,
     last_accessed_at TIMESTAMP
   );

   -- Overlay sync for discovery
   CREATE TABLE overlay_shared_resource (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     shared_resource_id UUID REFERENCES shared_resource(id),
     overlay_topic VARCHAR(100) NOT NULL,
     discovery_data JSONB,
     published_at TIMESTAMP DEFAULT NOW(),
     sync_status VARCHAR(20) DEFAULT 'synced'
   );
   ```

4. **Identity-based Access Control**
   ```typescript
   import { IdentityService } from '@bsv/identity-services';

   const validateBuyerIdentity = async (buyerAddress: string) => {
     const identityService = new IdentityService({
       network: process.env.BSV_NETWORK,
       overlayEndpoint: process.env.BSV_OVERLAY_ENDPOINT
     });

     // Resolve buyer's DID from their address
     const did = await identityService.resolveAddressToDID(buyerAddress);
     if (!did) {
       throw new Error('Buyer identity not found');
     }

     // Verify buyer's credentials if required
     const credentials = await identityService.getCredentials(did);
     console.log('Buyer identity verified:', did, credentials);
     
     return { did, credentials };
   };
   ```

### Step 6: Debug Logging
Implement detailed debug logging to track the sharing and micropayment process.

1. **Log Points**
   - Log when a user enables/disables sharing for an item.
   - Log payment initiation, success, and failure events.
   - Log access status changes for shared items.

2. **Log Format**
   - Use a consistent format for log messages, including timestamps and relevant data points (e.g., user ID, item ID, transaction ID).

### Step 6: Overlay Discovery and Public Marketplace
Implement public discovery of shared resources using BSV overlay topics.

```typescript
import { OverlayClient } from '@bsv/overlay';

const publishToOverlay = async (sharedResource: SharedResource) => {
  console.log('Publishing shared resource to overlay:', sharedResource.id);
  
  const overlayClient = new OverlayClient({
    network: process.env.BSV_NETWORK,
    endpoint: process.env.BSV_OVERLAY_ENDPOINT
  });

  const overlayData = {
    resource_id: sharedResource.id,
    title: sharedResource.title,
    description: sharedResource.description,
    price_satoshis: sharedResource.price_satoshis,
    owner_did: sharedResource.owner_did,
    access_policy: sharedResource.access_policy,
    created_at: sharedResource.created_at
  };

  await overlayClient.publish({
    topic: `shared_context_${sharedResource.category}`,
    data: overlayData
  });

  console.log('Resource published to overlay successfully');
};
```

### Step 7: Production Deployment with wallet-infra
Deploy using production-ready patterns from wallet-infra.

```typescript
// Production configuration
const productionConfig = {
  bsv: {
    network: 'mainnet',
    feeRate: 0.5, // satoshis per byte
    maxFeeRate: 10,
    confirmationTarget: 6
  },
  wallet: {
    encryptionKey: process.env.WALLET_ENCRYPTION_KEY,
    backupEnabled: true,
    multiSigRequired: false
  },
  api: {
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100 // limit each IP to 100 requests per windowMs
    },
    cors: {
      origin: process.env.ALLOWED_ORIGINS?.split(',') || [],
      credentials: true
    }
  }
};
```

### Step 8: Comprehensive Testing Strategy

1. **Unit Tests**
   ```typescript
   // __tests__/micropayment.test.ts
   import { processMicropayment } from '@/lib/micropayment';
   import { mockWallet, mockSharedResource } from '@/test/mocks';

   describe('Micropayment Processing', () => {
     test('should process valid micropayment', async () => {
       const result = await processMicropayment(mockSharedResource);
       expect(result.success).toBe(true);
       expect(result.txHash).toBeDefined();
     });

     test('should handle insufficient funds', async () => {
       const mockWalletLowBalance = { ...mockWallet, balance: 10 };
       await expect(
         processMicropayment(mockSharedResource, mockWalletLowBalance)
       ).rejects.toThrow('Insufficient funds');
     });
   });
   ```

2. **Integration Tests**
   ```typescript
   // __tests__/integration/sharing-flow.test.ts
   describe('Complete Sharing Flow', () => {
     test('should complete end-to-end sharing and payment', async () => {
       // 1. Create shared resource
       const resource = await createSharedResource(testData);
       
       // 2. Publish to overlay
       await publishToOverlay(resource);
       
       // 3. Process payment
       const payment = await processMicropayment(resource);
       
       // 4. Verify access granted
       const access = await verifyResourceAccess(resource.id, payment.txHash);
       expect(access.granted).toBe(true);
     });
   });
   ```

### Step 9: Monitoring and Analytics

```typescript
// lib/analytics.ts
import { Analytics } from '@bsv/wallet-infra';

const analytics = new Analytics({
  apiKey: process.env.ANALYTICS_API_KEY,
  environment: process.env.NODE_ENV
});

export const trackMicropayment = async (event: {
  resourceId: string;
  amount: number;
  buyerAddress: string;
  success: boolean;
}) => {
  await analytics.track('micropayment_processed', {
    ...event,
    timestamp: new Date().toISOString()
  });
};
```

### Conclusion
This enhanced implementation provides a production-ready sharing and pay-per-use access feature that:

- **Leverages Complete BSV Ecosystem**: Uses @bsv/sdk, wallet-toolbox, wallet-infra, and identity-services for robust functionality
- **Ensures Data Sovereignty**: Users maintain control over their SOLID pod data while enabling monetization
- **Provides Real-time Payments**: Instant micropayments with blockchain verification
- **Enables Public Discovery**: Overlay topics allow global resource discovery
- **Maintains Security**: End-to-end encryption and secure access control
- **Supports Scale**: Production-ready architecture with monitoring and analytics
- **Offers Comprehensive Testing**: Unit, integration, and end-to-end test coverage

The implementation follows modern development practices with comprehensive logging, error handling, and user experience optimization using shadcn/ui components and Tailwind CSS styling.