/*@jest-config-loader esbuild-register*/
import '@testing-library/jest-dom'

// Mock NextAuth
jest.mock('next-auth', () => ({
  default: jest.fn(),
}))

// Mock Supabase client
jest.mock('./utils/supabase/client', () => ({
  createClient: () => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: null, error: null })),
        })),
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: null, error: null })),
        })),
      })),
    })),
  }),
}))

// Mock environment variables
process.env = {
  ...process.env,
  NEXT_PUBLIC_SUPABASE_URL: 'https://mock.supabase.co',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'mock-anon-key',
}