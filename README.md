# SOLID+BSV: Decentralized Second Brain

A revolutionary decentralized second brain application that combines **SOLID pods** for personal data ownership with **BSV blockchain** for trustless timestamping, notarization, and micropayments. Build your personal knowledge vault while maintaining full control of your data.

## 🌟 Key Features

### Core Platform
- 🔐 **Secure Authentication** with Google OAuth via NextAuth
- 🏗️ **Modern Stack** - Next.js 15, React 19, TypeScript, Tailwind CSS
- 🎨 **Professional UI** - shadcn/ui components with responsive design
- 🗃️ **Robust Database** - Supabase (PostgreSQL) with Row Level Security

### Decentralized Architecture
- 🔒 **SOLID Pod Integration** - Your data, your pod, your control
- ⛓️ **BSV Blockchain** - Immutable timestamping and notarization
- 🆔 **Decentralized Identity** - DID/VC support for true data ownership
- 🌐 **Overlay Network** - Public discovery without compromising privacy

### Second Brain Features
- 🧠 **Context Management** - Rich knowledge entry and organization system
- 🔍 **Intelligent Search** - AI-powered content discovery and connections
- 📊 **Knowledge Graphs** - Visual representation of your knowledge network
- 🏷️ **Smart Tagging** - Automated content categorization and linking

### Monetization & Sharing
- 💰 **Micropayments** - Monetize your knowledge through BSV pay-per-access
- 🔗 **Selective Sharing** - Share specific resources while keeping others private
- 🏪 **Knowledge Marketplace** - Discover and access premium content from others
- 📜 **Verifiable Proofs** - Blockchain-backed authenticity for shared content

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm/yarn/pnpm
- Supabase account
- Google OAuth credentials
- BSV wallet (for blockchain features)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd solid-bsv
```

2. **Install dependencies**
```bash
npm install
# or
pnpm install
```

3. **Environment Setup**
```bash
cp .env.example .env.local
```

### Required Environment Variables

#### Core Configuration
```env
# NextAuth
AUTH_SECRET=your_auth_secret
NEXTAUTH_URL=http://localhost:3000
AUTH_TRUST_HOST=true

# Google OAuth
AUTH_GOOGLE_ID=your_google_client_id
AUTH_GOOGLE_SECRET=your_google_client_secret
```

#### Supabase Database
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SECRET_KEY=your_supabase_service_role_key
SUPABASE_JWT_SECRET=your_jwt_secret
```

#### BSV Integration (Coming Soon)
```env
BSV_PRIVATE_KEY=your_bsv_private_key
BSV_NETWORK=mainnet  # or testnet
OVERLAY_NETWORK_HOST=your_overlay_host
```

#### SOLID Pod Configuration (Coming Soon)
```env
SOLID_PROVIDER_URL=your_solid_provider
SOLID_CLIENT_ID=your_solid_client_id
```
