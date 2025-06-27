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

# Implementation Guide: Personal Dashboard & Navigation

## Task
Implement the Personal Dashboard and Navigation for the SOLID pods demo app.

## Implementation Guide

### Step 1: Update the Main Dashboard Layout

1. **File Location**: `app/app/layout.tsx`
   - Ensure the layout includes the `Header` and `Sidebar` components.
   - Use Tailwind CSS classes for styling, ensuring responsiveness and consistency with the app's theme.

2. **Header Component**: `components/app/Header.tsx`
   - Update the header to include the app name, user avatar, and quick links.
   - Use Tailwind classes like `bg-primary` and `text-primary-foreground` for styling.
   - Ensure the header is responsive and adapts to different screen sizes.

3. **Sidebar Component**: `components/app/Sidebar.tsx`
   - Create a new `Sidebar` component if it doesn't exist.
   - Include navigation links to major sections:
     - Personal Data Pod Management
     - SOLID Pods & Identity Management
     - Second Brain Context Layer
     - Data Sharing & Micropayments
   - Use Lucide React icons for navigation items.
   - Style the sidebar using Tailwind classes for a consistent look.

### Step 2: Define Global State for Navigation

1. **State Management**: Use React Context or a similar state management solution.
   - Define a global state to manage user information and navigation items.
   - Example interface for navigation state:

   ```typescript
   export interface AppState {
     user: {
       id: string;
       name: string;
       email: string;
       avatarUrl?: string;
     } | null;
     navigationItems: NavigationItem[];
     setUser: (user: AppState['user']) => void;
     setNavigationItems: (items: NavigationItem[]) => void;
   }

   export interface NavigationItem {
     label: string;
     path: string;
     icon?: React.ReactNode;
   }
   ```

2. **Initialize State**: In the main layout or a higher-level component, initialize the state with default navigation items and user information.

### Step 3: Implement the Personal Dashboard Page

1. **File Location**: `app/app/page.tsx`
   - Create a main dashboard page that loads the global layout.
   - Display a welcome message and high-level navigation cards or tabs directing users to the main sections.

2. **UI Components**:
   - Use shadcn/ui components for cards and navigation elements.
   - Ensure the design is responsive and visually appealing.

3. **Data Points**:
   - Display navigation items and user authentication state.
   - Include basic branding details.

### Step 4: Ensure Responsiveness and Accessibility

1. **Responsive Design**:
   - Use Tailwind's responsive utilities to ensure the layout adapts to different screen sizes.
   - Test the UI on various devices to ensure a consistent experience.

2. **Accessibility**:
   - Ensure all interactive elements are accessible via keyboard navigation.
   - Use semantic HTML and ARIA attributes where necessary to enhance accessibility.

### Step 5: Debug Logging

1. **Add Debug Logs**:
   - Include detailed debug logs to track navigation actions and state changes.
   - Example log statement:

   ```typescript
   console.log('Navigation item clicked:', navigationItem.label);
   ```

2. **Error Handling**:
   - Implement error handling for state updates and navigation actions.
   - Log errors with sufficient detail to aid in debugging.

By following these steps, you will create a cohesive and user-friendly Personal Dashboard and Navigation system for the SOLID pods demo app, ensuring a seamless user experience with clear navigation and robust state management.