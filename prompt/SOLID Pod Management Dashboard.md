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

# SOLID Pod Management Dashboard Implementation Guide

## Task
Implement the SOLID Pod Management Dashboard feature for users to view and manage their SOLID pod contents (which serves as their personal data vault) in the SOLID+BSV second brain app.

## Implementation Guide

### Overview
The SOLID Pod Management Dashboard allows users to view and manage their SOLID pod resources, which serve as their decentralized personal data vault. This pod-centric architecture ensures users maintain complete control over their data while leveraging BSV for public timestamping and micropayments.

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

6. **Integrate Supabase for Data Fetching**
   - **File**: `utils/supabase/client.ts`
   - **Purpose**: Fetch and update pod resources from the Supabase database using the pod_resource table.
   - **Example Code**:
     ```typescript
     import { createSupabaseClient } from '@/utils/supabase/client';

     export async function fetchPodResources() {
       const supabase = await createSupabaseClient();
       const { data, error } = await supabase
         .from('pod_resource')
         .select('*')
         .order('created_at', { ascending: false });
       if (error) {
         console.error('Error fetching pod resources:', error);
         return [];
       }
       console.log('Pod resources fetched successfully:', data);
       return data;
     }

     export async function updatePodResourceStatus(id: number, updates: any) {
       const supabase = await createSupabaseClient();
       const { data, error } = await supabase
         .from('pod_resource')
         .update(updates)
         .eq('id', id)
         .select();
       if (error) {
         console.error('Error updating pod resource:', error);
         return null;
       }
       console.log('Pod resource updated successfully:', data);
       return data[0];
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

### Summary
This implementation guide provides a step-by-step approach to building the SOLID Pod Management Dashboard feature. By following these steps, developers can create a robust and user-friendly interface for managing decentralized personal data vaults within the SOLID+BSV second brain app, ensuring users maintain complete control over their data while leveraging blockchain capabilities for attestation and monetization.