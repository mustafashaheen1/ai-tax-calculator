'use client'

import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react'
import { Send } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface ChatInterfaceProps {
  onMessageSent?: (message: string) => void
}

interface ChatInterfaceRef {
  addCalculationResult: (type: string, result: Record<string, unknown>) => void
}

export const ChatInterface = forwardRef<ChatInterfaceRef, ChatInterfaceProps>(({ onMessageSent }, ref) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your AI tax advisor. I can help you understand tax implications, donation strategies, and answer any questions about tax planning. How can I assist you today?',
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const formatCalculationResult = (type: string, result: Record<string, unknown>) => {
    if (type === 'estimate_savings') {
      const data = result as {
        donationAmount?: number
        estimatedTaxSavings?: number
        effectiveDeductionRate?: number
        netCostOfDonation?: number
        marginalTaxRate?: number
        recommendation?: string
      }

      return `## Tax Savings Calculation Results

**Donation Amount:** $${data.donationAmount?.toLocaleString() || 'N/A'}
**Estimated Tax Savings:** $${data.estimatedTaxSavings?.toLocaleString() || 'N/A'}
**Effective Deduction Rate:** ${data.effectiveDeductionRate || 'N/A'}%
**Net Cost of Donation:** $${data.netCostOfDonation?.toLocaleString() || 'N/A'}
**Your Marginal Tax Rate:** ${data.marginalTaxRate || 'N/A'}%

**Analysis:** ${data.recommendation || 'No recommendation available.'}

*This is an estimate for planning purposes. Please consult with a qualified tax professional before making any financial decisions.*`

    } else if (type === 'evaluate_donation') {
      const data = result as {
        targetTaxSavings?: number
        recommendedDonationAmount?: number
        projectedTaxSavings?: number
        netCostToYou?: number
        currentTaxLiability?: number
        newTaxLiability?: number
        recommendation?: string
      }

      return `## Donation Amount Evaluation Results

**Target Tax Savings:** $${data.targetTaxSavings?.toLocaleString() || 'N/A'}
**Recommended Donation Amount:** $${data.recommendedDonationAmount?.toLocaleString() || 'N/A'}
**Projected Tax Savings:** $${data.projectedTaxSavings?.toLocaleString() || 'N/A'}
**Net Cost to You:** $${data.netCostToYou?.toLocaleString() || 'N/A'}

**Tax Liability Comparison:**
- Current: $${data.currentTaxLiability?.toLocaleString() || 'N/A'}
- With Donation: $${data.newTaxLiability?.toLocaleString() || 'N/A'}

**Analysis:** ${data.recommendation || 'No recommendation available.'}

*This is an estimate for planning purposes. Please consult with a qualified tax professional before making any financial decisions.*`
    }

    return `Calculation completed for ${type}: ${JSON.stringify(result, null, 2)}`
  }

  useImperativeHandle(ref, () => ({
    addCalculationResult: (type: string, result: Record<string, unknown>) => {
      const calculationMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: formatCalculationResult(type, result),
        timestamp: new Date()
      }

      setMessages(prev => [...prev, calculationMessage])
    }
  }))

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!inputMessage.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    if (onMessageSent) {
      onMessageSent(inputMessage.trim())
    }

    // Simulate AI response
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          sessionId: Date.now().toString()
        }),
      })

      const data = await response.json()

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message?.content || 'I apologize, but I encountered an error processing your request.',
        timestamp: new Date()
      }

      setMessages(prev => [...prev, aiMessage])
    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please try again.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white h-full flex flex-col">
      {/* 3D Avatar Section */}
      <div className="bg-gray-50 p-4 border-b border-gray-200">
        <div className="flex items-center justify-center">
          <div className="w-20 h-20 bg-gradient-to-br from-gray-300 to-gray-500 rounded-full flex items-center justify-center text-white font-bold text-lg animate-pulse">
            AI
          </div>
        </div>
        <p className="text-center text-sm text-gray-600 mt-2">
          AI Tax Advisor
        </p>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.role === 'user'
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-black border border-gray-200'
              }`}
            >
              <div className="text-sm">
                {message.content.includes('##') ? (
                  <div className="space-y-2">
                    {message.content.split('\n').map((line, index) => {
                      if (line.startsWith('## ')) {
                        return <h3 key={index} className="font-bold text-lg text-gray-900">{line.replace('## ', '')}</h3>
                      } else if (line.startsWith('**') && line.endsWith('**')) {
                        return <p key={index} className="font-semibold">{line.replace(/\*\*/g, '')}</p>
                      } else if (line.startsWith('*') && line.endsWith('*')) {
                        return <p key={index} className="italic text-gray-600 text-xs">{line.replace(/\*/g, '')}</p>
                      } else if (line.startsWith('- ')) {
                        return <p key={index} className="ml-4">{line}</p>
                      } else if (line.trim() === '') {
                        return <div key={index} className="h-2"></div>
                      } else {
                        return <p key={index}>{line}</p>
                      }
                    })}
                  </div>
                ) : (
                  <p>{message.content}</p>
                )}
              </div>
              <p className={`text-xs mt-1 ${
                message.role === 'user' ? 'text-gray-300' : 'text-gray-500'
              }`}>
                {message.timestamp.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-black border border-gray-200 max-w-xs lg:max-w-md px-4 py-2 rounded-lg">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t border-gray-200 p-4">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask about tax strategies, donations, or planning..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !inputMessage.trim()}
            className="bg-black text-white p-2 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  )
})

ChatInterface.displayName = 'ChatInterface'
