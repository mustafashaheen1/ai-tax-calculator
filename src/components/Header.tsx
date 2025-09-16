'use client'

import Image from 'next/image'
import { useSession, signOut } from 'next-auth/react'

export function Header() {
  const { data: session } = useSession()

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="w-10 h-10 relative bg-black rounded-lg flex items-center justify-center">
          <Image
            src="/logo.png"
            alt="Company Logo"
            width={40}
            height={40}
            className="object-contain"
            onError={(e) => {
              // Fallback to text if image not found
              e.currentTarget.style.display = 'none';
              e.currentTarget.parentElement!.innerHTML = '<span class="text-white text-2xl font-bold">H</span>';
            }}
          />
        </div>

        {session && (
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              Welcome, {session.user?.name || session.user?.email}
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="text-sm text-gray-500 hover:text-gray-700 border border-gray-300 px-3 py-1 rounded"
            >
              Sign Out
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
