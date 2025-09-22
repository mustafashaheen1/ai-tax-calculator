'use client'

import { useState, useEffect, useRef } from 'react'
import { Header } from './Header'
import { TaxCalculatorPanel } from './TaxCalculatorPanel'
import { ChatInterface } from './ChatInterface'

export function Dashboard() {
  const [sessionId, setSessionId] = useState<string | null>(null)
  const chatRef = useRef<{ addCalculationResult: (type: string, result: Record<string, unknown>) => void }>(null)

  useEffect(() => {
    // Generate a session ID for this session
    setSessionId(Date.now().toString())
  }, [])

  const handleCalculation = (type: string, result: Record<string, unknown>) => {
    console.log('Calculation completed:', { type, result })

    // Send calculation results to chat interface
    if (chatRef.current) {
      chatRef.current.addCalculationResult(type, result)
    }
  }

  const handleMessageSent = (message: string) => {
    console.log('Message sent:', message)
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Header />
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Tax Calculator */}
        <div className="w-1/2 border-r border-gray-200">
          <TaxCalculatorPanel onCalculation={handleCalculation} />
        </div>

        {/* Right Panel - Chat Interface */}
        <div className="w-1/2">
          <ChatInterface ref={chatRef} onMessageSent={handleMessageSent} />
        </div>
      </div>
    </div>
  )
}
