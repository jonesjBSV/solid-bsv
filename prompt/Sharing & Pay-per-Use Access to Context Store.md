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

# Feature Implementation Guide: Sharing & Pay-per-Use Access to Context Store

## Task Overview
Implement a feature that allows users to share access to their personal context store or pod resources with other users for a fee on a pay-per-use basis via micropayments.

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

### Step 4: Micropayment Integration
Integrate micropayment functionality using a BSV micropayment library.

1. **Payment Workflow**
   - **Trigger**: When a user requests access to a shared item.
   - **Process**:
     - Display a "Request Access" or "Purchase Access" button next to shared items.
     - On button click, initiate the micropayment process.
     - Use a BSV micropayment library to handle the transaction.
     - Update the item's access status upon successful payment.

2. **UI Feedback**
   - Use shadcn/ui toast or alert components to provide real-time feedback on payment status (e.g., "Payment Successful", "Access Granted").
   - Update the UI to reflect the new access status immediately.

### Step 5: Backend Integration
Ensure backend actions support the sharing and micropayment functionality.

1. **API Routes**
   - **Location**: `app/api/(payment)/`
   - **Purpose**: Handle payment processing and update the database with payment receipts and access status.

2. **Supabase Integration**
   - Use Supabase to store and retrieve sharing configurations and payment details.
   - Ensure secure handling of user data and payment information.

### Step 6: Debug Logging
Implement detailed debug logging to track the sharing and micropayment process.

1. **Log Points**
   - Log when a user enables/disables sharing for an item.
   - Log payment initiation, success, and failure events.
   - Log access status changes for shared items.

2. **Log Format**
   - Use a consistent format for log messages, including timestamps and relevant data points (e.g., user ID, item ID, transaction ID).

### Conclusion
By following these steps, you will implement a robust sharing and pay-per-use access feature for the context store, allowing users to monetize their data while maintaining control. Ensure all components are styled consistently using Tailwind and shadcn/ui, and integrate detailed logging for easy debugging and tracking of user actions.