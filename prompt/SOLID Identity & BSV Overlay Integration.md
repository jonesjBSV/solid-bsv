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

# SOLID Identity & BSV Overlay Integration Implementation Guide

## Task
Implement the Decentralized Identity (DID) and Verifiable Credentials (VC) integration with BSV overlay topics for the SOLID+BSV second brain app.

## Implementation Guide

### Overview
The goal is to allow users to manage their decentralized identity by linking their SOLID pod, managing DIDs, and handling verifiable credentials. DIDs and VCs will be timestamped using BSV and stored both in the Supabase DB and on the BSV overlay using tm_did and tm_vc topics for public discovery. This feature will be accessible from the main navigation and will leverage existing authentication flows.

### Steps

1. **Create the Identity Management Page**
   - **File Location**: `app/identity/page.tsx`
   - **Purpose**: This page will display the current DID information, a list of VCs, BSV attestation status, and provide forms to upload DIDs/VCs to both SOLID pod and BSV overlay.

2. **Design the UI**
   - Use `shadcn/ui` components for a consistent look and feel.
   - **Components to Use**:
     - `Form` for input fields.
     - `Button` for actions like linking a SOLID pod or uploading a DID document.
     - `Card` for displaying DID and VC information.
     - `Badge` for status indicators (Connected, Timestamped, Verified).
   - **Styling**: Use Tailwind CSS variable-based colors (e.g., `bg-primary`, `text-primary-foreground`).

3. **Implement the UI Components**
   - **IdentityManagement.tsx**: Create a component to manage DIDs and VCs with BSV integration.
     - **Location**: `components/app/IdentityManagement.tsx`
     - **Features**:
       - Display current SOLID pod URL, DID, VCs, and BSV attestation status.
       - Show BSV transaction hashes and overlay topics (tm_did, tm_vc).
       - Provide input fields for linking a SOLID pod and uploading DID/VC documents.
       - Buttons for actions like "Link Pod", "Upload DID to Pod + Overlay", "Upload VC to Pod + Overlay", "View on Overlay".
       - Display overlay discovery status and allow other users to lookup DIDs/VCs.
       - Use `Lucide React` icons for visual enhancements.

4. **State Management**
   - **Interface**: Define a `SolidIdentity` interface in `types/`.
     ```typescript
     export interface SolidIdentity {
       id: string;
       solidPodUrl: string;
       did: string;
       didDocument?: any;
       didBsvHash?: string;  // BSV transaction hash for DID timestamping
       didOverlayTopic: string; // Default 'tm_did' for overlay discovery
       vc?: any;
       vcBsvHash?: string;   // BSV transaction hash for VC timestamping
       vcOverlayTopic: string; // Default 'tm_vc' for overlay discovery
       connectionStatus: 'connected' | 'disconnected' | 'pending';
       accessToken?: string; // SOLID pod access token (encrypted)
       createdAt: Date;
       updatedAt: Date;
     }
     ```
   - **State Hook**: Use React state or context to manage the identity state.
     - **Example**:
       ```typescript
       const [identity, setIdentity] = useState<SolidIdentity | null>(null);
       ```

5. **Backend Integration**
   - **Database Schema**: Ensure the `identity` table in Supabase includes BSV and overlay fields as per the updated schema.
   - **API Routes**: Use existing authentication and Supabase utilities to handle data fetching and updates, including BSV attestation creation.
     - **Example**:
       ```typescript
       import { createSupabaseClient } from '@/utils/supabase/client';
       const supabase = await createSupabaseClient();
       const { data, error } = await supabase
         .from('identity')
         .select('*, bsv_attestation(*)')
         .single();
       if (error) {
         console.error('Error fetching identity with attestations:', error);
       }
       console.log('Identity with BSV attestations loaded:', data);
       ```

6. **Linking SOLID Pod**
   - **Form Submission**: Capture the SOLID pod URL, authenticate, and update the state and database.
   - **Example**:
     ```typescript
     const handleLinkPod = async (url: string, accessToken?: string) => {
       console.log('Linking SOLID pod:', url);
       // Update state
       setIdentity((prev) => ({ 
         ...prev, 
         solidPodUrl: url, 
         accessToken,
         connectionStatus: 'connected' 
       }));
       // Update database
       const { error } = await supabase.from('identity').update({ 
         solid_pod_url: url,
         access_token: accessToken,
         connection_status: 'connected'
       }).eq('id', identity.id);
       if (error) {
         console.error('Error linking SOLID pod:', error);
       } else {
         console.log('SOLID pod linked successfully');
       }
     };
     ```

7. **Uploading DID and VC with BSV Overlay Integration**
   - **Dual Storage**: Upload DID documents and VCs to both SOLID pod and BSV overlay with timestamping.
   - **Example**:
     ```typescript
     const handleUploadDID = async (didDocument: any) => {
       console.log('Uploading DID document to pod and overlay:', didDocument);
       
       // 1. Store in SOLID pod
       // ... SOLID pod storage logic ...
       
       // 2. Create BSV transaction for timestamping
       const contentHash = await hashContent(didDocument);
       const bsvTxHash = await createBSVTransaction(contentHash, 'tm_did');
       
       // 3. Update state
       setIdentity((prev) => ({ 
         ...prev, 
         didDocument,
         didBsvHash: bsvTxHash,
         didOverlayTopic: 'tm_did'
       }));
       
       // 4. Update database with BSV attestation
       const { error } = await supabase.from('identity').update({ 
         did_document: didDocument,
         did_bsv_hash: bsvTxHash,
         did_overlay_topic: 'tm_did'
       }).eq('id', identity.id);
       
       if (error) {
         console.error('Error uploading DID document:', error);
       } else {
         console.log('DID document uploaded and timestamped:', bsvTxHash);
         // Create BSV attestation record
         await createBSVAttestation(identity.id, 'did', bsvTxHash, contentHash);
       }
     };
     
     const handleUploadVC = async (vcDocument: any) => {
       console.log('Uploading VC to pod and overlay:', vcDocument);
       
       // Similar process for VC with 'tm_vc' topic
       const contentHash = await hashContent(vcDocument);
       const bsvTxHash = await createBSVTransaction(contentHash, 'tm_vc');
       
       setIdentity((prev) => ({ 
         ...prev, 
         vc: vcDocument,
         vcBsvHash: bsvTxHash,
         vcOverlayTopic: 'tm_vc'
       }));
       
       const { error } = await supabase.from('identity').update({ 
         vc: vcDocument,
         vc_bsv_hash: bsvTxHash,
         vc_overlay_topic: 'tm_vc'
       }).eq('id', identity.id);
       
       if (!error) {
         console.log('VC uploaded and timestamped:', bsvTxHash);
         await createBSVAttestation(identity.id, 'vc', bsvTxHash, contentHash);
       }
     };
     ```

8. **Displaying DID and VC Information with BSV Status**
   - Use `Card` components to display the current DID and VC information including BSV attestation status.
   - Show BSV transaction hashes, overlay topics, and timestamps.
   - Provide buttons to view documents on BSV overlay explorer.
   - Display connection status and attestation status with color-coded badges.
   - Allow other users to search/lookup DIDs and VCs from overlay topics.
   - Ensure the UI provides clear feedback on the connection status and any errors.

9. **BSV Overlay Discovery Interface**
   - **Public Lookup**: Create a search interface for other users to discover DIDs and VCs.
   - **Features**:
     - Search by DID or VC identifier
     - Browse by overlay topics (tm_did, tm_vc)
     - Display verification status and timestamps
     - Show micropayment pricing for data access
     - Link to SOLID pod for data purchase

10. **Debug Logging**
   - Add detailed console logs for each major action including BSV operations.
   - Example:
     ```typescript
     console.log('Linking SOLID pod with URL:', url);
     console.log('Creating BSV transaction for DID:', contentHash);
     console.log('BSV transaction created:', txHash);
     console.log('Publishing to overlay topic tm_did:', txHash);
     console.log('DID document stored in pod at:', podUrl);
     console.log('BSV attestation record created:', attestationId);
     console.log('Overlay sync completed for topic:', overlayTopic);
     ```

### User Flow & UI
- The user navigates to the "SOLID Identity" section.
- They see SOLID pod connection status and fields to input/update their pod URL, DID, and VCs.
- Users can upload DID documents to both their pod and BSV overlay with tm_did topic.
- Users can upload VCs to both their pod and BSV overlay with tm_vc topic.
- BSV transaction hashes and timestamps are displayed for each uploaded document.
- Other users can lookup DIDs and VCs from the overlay using tm_did and tm_vc topics.
- DID documents reference user pods and include pricing for individual data access.
- Provide instant visual feedback with badges: "Pod Connected", "DID Timestamped", "VC Verified", etc.

### Data Points
- SOLID pod URL, access token, connection status
- DID document, BSV transaction hash, overlay topic (tm_did)
- VC document, BSV transaction hash, overlay topic (tm_vc)
- BSV attestation records with timestamps and content hashes
- Overlay sync status and discovery metadata
- Micropayment pricing for data access

### Key Features
1. **Dual Storage**: Documents stored in both SOLID pod (private) and BSV overlay (public discovery)
2. **BSV Timestamping**: Immutable proof of existence for DIDs and VCs
3. **Overlay Discovery**: Public lookup via tm_did and tm_vc topics
4. **Pod Integration**: DID documents reference user's SOLID pod with access pricing
5. **Cross-User Discovery**: Other users can find and verify DIDs/VCs from overlay
6. **Micropayment Integration**: Paid access to detailed identity data and credentials
7. **Verification Status**: Real-time verification of document authenticity via BSV blockchain

### Summary
By following these steps, you will implement a robust decentralized identity management feature with BSV overlay integration that allows for both private pod storage and public discovery, ensuring users maintain sovereignty over their identity while enabling verifiable, timestamped credentials accessible across the network. This creates a complete identity ecosystem where users control their data but can monetize access through micropayments.