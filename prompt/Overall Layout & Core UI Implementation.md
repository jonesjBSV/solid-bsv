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

# Overall Layout & Core UI Implementation Guide

## Task
Implement the overall application layout and core UI setup for the SOLID pods demo app.

## Implementation Guide

### Step 1: Update the Main Dashboard Page

1. **File Location**: `app/app/page.tsx`
2. **Objective**: Create a consistent and branded gateway to all major sections of the app.
3. **Implementation**:
   - Use a shell layout that includes a sidebar or top-level navigation.
   - Ensure the navigation links to the following sections:
     - Personal Data Pod Management (Dashboard)
     - SOLID Pods & Identity Management
     - Second Brain Context Layer
     - Data Sharing & Micropayments
   - Use Tailwind CSS classes for styling, such as `bg-primary` and `text-primary-foreground`.

### Step 2: Update the Header Component

1. **File Location**: `components/app/Header.tsx`
2. **Objective**: Ensure the header matches the overall app style.
3. **Implementation**:
   - Use Tailwind CSS variable-based colors for styling.
   - Include the app name, user avatar, and quick links in the header.
   - Ensure the header is responsive and adapts to different screen sizes.

### Step 3: Integrate Navigation Components

1. **Objective**: Use existing navigation components from shadcn/ui for a responsive navigation bar.
2. **Implementation**:
   - Check if shadcn/ui provides any navigation components that can be reused.
   - If available, integrate these components into the sidebar or top-level navigation.
   - Ensure the navigation is intuitive and easy to use.

### Step 4: Define Global State Placeholders

1. **Objective**: Set up placeholders for global state management.
2. **Implementation**:
   - Use React Context or direct props to manage global state.
   - Define placeholders for user identity and vault information.
   - Ensure the state is easily accessible across different components.

### Step 5: Ensure Responsive Layout

1. **Objective**: Create a layout that adapts across devices.
2. **Implementation**:
   - Use Tailwind CSS classes to ensure responsiveness.
   - Test the layout on different screen sizes to ensure it looks good on all devices.

### Debug Logging

1. **Objective**: Implement detailed debug logging to track what worked versus what didn't.
2. **Implementation**:
   - Use `console.log` statements to log key actions and state changes.
   - Ensure logs are clear and provide enough context to understand the flow of the application.
   - Example:
     ```javascript
     console.log("Navigation item clicked:", navigationItem);
     console.log("User state updated:", userState);
     ```

### Example Code Snippet

Here is an example of how you might structure the main dashboard page with a sidebar and header:

```typescript
import React from 'react';
import Header from '@/components/app/Header';
import Sidebar from '@/components/app/Sidebar';

const DashboardPage: React.FC = () => {
  return (
    <div className="flex h-screen bg-primary">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-4">
          <h1 className="text-primary-foreground">Welcome to the Dashboard</h1>
          {/* Add navigation cards or tabs here */}
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;
```

### Summary

- Update `app/app/page.tsx` to include a sidebar or top-level navigation.
- Update `components/app/Header.tsx` to match the overall app style.
- Use existing navigation components from shadcn/ui if available.
- Define global state placeholders for user identity and vault information.
- Ensure the layout is responsive using Tailwind CSS classes.
- Implement detailed debug logging to track application flow.

This guide provides a clear and detailed plan for implementing the overall layout and core UI for the SOLID pods demo app, ensuring a consistent and branded user experience.