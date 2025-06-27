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

# Wallet Management & Micropayments Implementation Guide

## Task
Implement the Wallet Management & Micropayments feature in the SOLID pods demo app.

## Implementation Guide

### Overview
The Wallet Management & Micropayments feature allows users to view their wallet balance, transaction history, and perform micropayment actions. This feature will be implemented in the `app/wallet/page.tsx` file and will utilize components from the `components/app/` directory.

### Steps

1. **Create the Wallet Page**
   - **File**: `app/wallet/page.tsx`
   - **Purpose**: This page will display the user's wallet balance, transaction history, and provide actions for micropayments.
   - **Components to Use**: `WalletCard`, `TransactionList`

2. **Implement the WalletCard Component**
   - **File**: `components/app/WalletCard.tsx`
   - **Purpose**: Display the user's current wallet balance and provide actions such as "Top Up Wallet" and "Send Payment".
   - **UI Requirements**:
     - Use `shadcn/ui` components for buttons and cards.
     - Style with Tailwind CSS using classes like `bg-primary` and `text-primary-foreground`.
   - **State Management**:
     - Use the `WalletState` interface to manage wallet balance and transactions.
     - Implement functions to update the wallet balance and handle top-up or payment actions.

3. **Implement the TransactionList Component**
   - **File**: `components/app/TransactionList.tsx`
   - **Purpose**: Display a list of wallet transactions, including credits and debits.
   - **UI Requirements**:
     - Use `shadcn/ui` components for list items.
     - Style with Tailwind CSS for consistency.
   - **State Management**:
     - Use the `WalletState` interface to manage and display the list of transactions.
     - Implement functions to add new transactions and update the list dynamically.

4. **Integrate BSV Micropayment Library**
   - **Purpose**: Handle micropayment actions using a real BSV micropayment library.
   - **Steps**:
     - Import the BSV library in `WalletCard.tsx`.
     - Implement functions to initiate micropayments and handle transaction confirmations.
     - Ensure offline support by queuing transactions and syncing when online.

5. **Update the Wallet State**
   - **File**: `components/app/WalletCard.tsx`
   - **Purpose**: Manage the wallet state, including balance and transaction history.
   - **State Management**:
     - Use React Context or local state to manage wallet data.
     - Implement functions to update the wallet balance and transaction list after each action.

6. **Add Debug Logging**
   - **Purpose**: Provide detailed logs for debugging and tracking user actions.
   - **Steps**:
     - Add console logs for each major action (e.g., top-up, payment, transaction update).
     - Log errors and success messages for micropayment actions.

### User Flow & UI

- **Wallet Page**: Users navigate to the wallet page to view their balance and transaction history.
- **WalletCard**: Displays the current balance and provides buttons for "Top Up Wallet" and "Send Payment".
- **TransactionList**: Shows a list of past transactions with details like amount, type, and date.
- **Micropayment Actions**: Users can initiate payments, and the UI updates to reflect the new balance and transaction status.

### Data Points

- **Wallet Balance**: Current balance of the user's wallet.
- **Transactions**: List of past transactions, including amount, type, and date.
- **Micropayment Status**: Status of each micropayment action (e.g., pending, completed).

### Example Code Snippets

#### WalletCard Component

```typescript
import React from 'react';
import { Button, Card } from '@/components/ui';
import { WalletState } from '@/types';

const WalletCard: React.FC<{ walletState: WalletState }> = ({ walletState }) => {
  const handleTopUp = () => {
    console.log('Top Up Wallet');
    // Implement top-up logic
  };

  const handleSendPayment = () => {
    console.log('Send Payment');
    // Implement payment logic
  };

  return (
    <Card className="bg-primary text-primary-foreground">
      <h2>Wallet Balance: {walletState.balance}</h2>
      <Button onClick={handleTopUp}>Top Up Wallet</Button>
      <Button onClick={handleSendPayment}>Send Payment</Button>
    </Card>
  );
};

export default WalletCard;
```

#### TransactionList Component

```typescript
import React from 'react';
import { WalletTransaction } from '@/types';

const TransactionList: React.FC<{ transactions: WalletTransaction[] }> = ({ transactions }) => {
  return (
    <ul>
      {transactions.map((tx) => (
        <li key={tx.id} className="bg-primary text-primary-foreground">
          {tx.transactionType}: {tx.amount} - {tx.createdAt.toLocaleDateString()}
        </li>
      ))}
    </ul>
  );
};

export default TransactionList;
```

### Conclusion

This guide provides a detailed breakdown of implementing the Wallet Management & Micropayments feature, ensuring a seamless user experience with robust state management and clear UI feedback. Follow the steps to integrate the feature into the SOLID pods demo app, leveraging existing components and libraries for efficient development.