import { Metadata } from 'next'
import { SearchPageContent } from '@/components/search/SearchPageContent'

export const metadata: Metadata = {
  title: 'Search | SOLID BSV Second Brain',
  description: 'Search through your knowledge base, notes, and shared resources',
}

export default function SearchPage() {
  return <SearchPageContent />
}