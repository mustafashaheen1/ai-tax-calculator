'use client'

import { useState } from 'react'
import * as Tabs from '@radix-ui/react-tabs'

interface EstimateSavingsForm {
  annualIncome: string
  currentTaxRate: string
  donationAmount: string
  filingStatus: string
}

interface EvaluateDonationForm {
  targetTaxSavings: string
  annualIncome: string
  filingStatus: string
  currentDeductions: string
}

interface TaxCalculatorPanelProps {
  onCalculation: (type: string, data: Record<string, unknown>) => void
}

export function TaxCalculatorPanel({ onCalculation }: TaxCalculatorPanelProps) {
  const [activeTab, setActiveTab] = useState('estimate-savings')

  const [estimateForm, setEstimateForm] = useState<EstimateSavingsForm>({
    annualIncome: '',
    currentTaxRate: '',
    donationAmount: '',
    filingStatus: 'single'
  })

  const [evaluateForm, setEvaluateForm] = useState<EvaluateDonationForm>({
    targetTaxSavings: '',
    annualIncome: '',
    filingStatus: 'single',
    currentDeductions: ''
  })

  const handleEstimateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch('/api/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'estimate_savings',
          data: estimateForm
        }),
      })

      const result = await response.json()
      onCalculation('estimate_savings', result)
    } catch (error) {
      console.error('Calculation error:', error)
    }
  }

  const handleEvaluateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch('/api/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'evaluate_donation',
          data: evaluateForm
        }),
      })

      const result = await response.json()
      onCalculation('evaluate_donation', result)
    } catch (error) {
      console.error('Calculation error:', error)
    }
  }

  return (
    <div className="bg-white h-full flex flex-col">
      <Tabs.Root value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <Tabs.List className="flex border-b border-gray-200">
          <Tabs.Trigger
            value="estimate-savings"
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'estimate-savings'
                ? 'border-black text-black bg-gray-50'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Estimate Tax Savings
          </Tabs.Trigger>
          <Tabs.Trigger
            value="evaluate-donation"
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'evaluate-donation'
                ? 'border-black text-black bg-gray-50'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Evaluate Donation Amount
          </Tabs.Trigger>
        </Tabs.List>

        <div className="flex-1 p-6">
          <Tabs.Content value="estimate-savings" className="h-full">
            <form onSubmit={handleEstimateSubmit} className="space-y-4">
              <h2 className="text-lg font-semibold text-black mb-4">
                Calculate Your Tax Savings
              </h2>

              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Annual Income
                </label>
                <input
                  type="number"
                  value={estimateForm.annualIncome}
                  onChange={(e) => setEstimateForm(prev => ({ ...prev, annualIncome: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                  placeholder="Enter your annual income"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Filing Status
                </label>
                <select
                  value={estimateForm.filingStatus}
                  onChange={(e) => setEstimateForm(prev => ({ ...prev, filingStatus: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                >
                  <option value="single">Single</option>
                  <option value="married-filing-jointly">Married Filing Jointly</option>
                  <option value="married-filing-separately">Married Filing Separately</option>
                  <option value="head-of-household">Head of Household</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Current Tax Rate (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={estimateForm.currentTaxRate}
                  onChange={(e) => setEstimateForm(prev => ({ ...prev, currentTaxRate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                  placeholder="Enter your current tax rate"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Donation Amount
                </label>
                <input
                  type="number"
                  value={estimateForm.donationAmount}
                  onChange={(e) => setEstimateForm(prev => ({ ...prev, donationAmount: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                  placeholder="Enter planned donation amount"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full mt-6 bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
              >
                Calculate Tax Savings
              </button>
            </form>
          </Tabs.Content>

          <Tabs.Content value="evaluate-donation" className="h-full">
            <form onSubmit={handleEvaluateSubmit} className="space-y-4">
              <h2 className="text-lg font-semibold text-black mb-4">
                Find Optimal Donation Amount
              </h2>

              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Target Tax Savings
                </label>
                <input
                  type="number"
                  value={evaluateForm.targetTaxSavings}
                  onChange={(e) => setEvaluateForm(prev => ({ ...prev, targetTaxSavings: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                  placeholder="Enter desired tax savings"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Annual Income
                </label>
                <input
                  type="number"
                  value={evaluateForm.annualIncome}
                  onChange={(e) => setEvaluateForm(prev => ({ ...prev, annualIncome: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                  placeholder="Enter your annual income"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Filing Status
                </label>
                <select
                  value={evaluateForm.filingStatus}
                  onChange={(e) => setEvaluateForm(prev => ({ ...prev, filingStatus: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                >
                  <option value="single">Single</option>
                  <option value="married-filing-jointly">Married Filing Jointly</option>
                  <option value="married-filing-separately">Married Filing Separately</option>
                  <option value="head-of-household">Head of Household</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Current Deductions
                </label>
                <input
                  type="number"
                  value={evaluateForm.currentDeductions}
                  onChange={(e) => setEvaluateForm(prev => ({ ...prev, currentDeductions: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                  placeholder="Enter current deductions"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full mt-6 bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
              >
                Find Optimal Donation
              </button>
            </form>
          </Tabs.Content>
        </div>
      </Tabs.Root>
    </div>
  )
}
