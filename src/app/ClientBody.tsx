'use client'

import { Providers } from '../components/Providers'

interface ClientBodyProps {
  children: React.ReactNode
}

export default function ClientBody({ children }: ClientBodyProps) {
  return <Providers>{children}</Providers>
}