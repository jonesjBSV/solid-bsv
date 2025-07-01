'use client'

import { useState, useEffect, useCallback } from 'react'
import { WalletClient, type BRC100Options } from '@/lib/bsv/wallet-client'

interface BSVWalletState {
  wallet: WalletClient | null
  isConnected: boolean
  isLoading: boolean
  error: string | null
  balance: { confirmed: number; unconfirmed: number } | null
}

interface BSVWalletActions {
  connect: () => Promise<void>
  disconnect: () => Promise<void>
  refreshBalance: () => Promise<void>
}

type UseBSVWalletReturn = BSVWalletState & BSVWalletActions

export function useBSVWallet(): UseBSVWalletReturn {
  const [state, setState] = useState<BSVWalletState>({
    wallet: null,
    isConnected: false,
    isLoading: false,
    error: null,
    balance: null,
  })

  const connect = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))
    
    try {
      const options: BRC100Options = {
        standard: 'BRC-100',
        permissions: ['sign-transaction', 'get-address', 'get-identity-key'],
        requestUserConsent: true,
      }
      
      const wallet = await WalletClient.connect(options)
      const balance = await wallet.getBalance()
      
      setState({
        wallet,
        isConnected: true,
        isLoading: false,
        error: null,
        balance,
      })
      
      // Store connection state in localStorage
      localStorage.setItem('bsv_wallet_connected', 'true')
      localStorage.setItem('bsv_wallet_address', wallet.address)
    } catch (err) {
      console.error('BSV wallet connection error:', err)
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Failed to connect wallet',
        isLoading: false,
      }))
    }
  }, [])

  const disconnect = useCallback(async () => {
    try {
      if (state.wallet) {
        await state.wallet.disconnect()
      }
      
      setState({
        wallet: null,
        isConnected: false,
        isLoading: false,
        error: null,
        balance: null,
      })
      
      // Clear connection state from localStorage
      localStorage.removeItem('bsv_wallet_connected')
      localStorage.removeItem('bsv_wallet_address')
    } catch (err) {
      console.error('BSV wallet disconnect error:', err)
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Failed to disconnect wallet',
      }))
    }
  }, [state.wallet])

  const refreshBalance = useCallback(async () => {
    if (!state.wallet || !state.isConnected) {
      return
    }
    
    try {
      const balance = await state.wallet.getBalance()
      setState(prev => ({ ...prev, balance }))
    } catch (err) {
      console.error('Failed to refresh balance:', err)
    }
  }, [state.wallet, state.isConnected])

  // Check for existing connection on mount
  useEffect(() => {
    const checkExistingConnection = async () => {
      setState(prev => ({ ...prev, isLoading: true }))
      
      try {
        const wasConnected = localStorage.getItem('bsv_wallet_connected')
        const storedAddress = localStorage.getItem('bsv_wallet_address')
        
        if (wasConnected && storedAddress) {
          // Try to reconnect to the same wallet
          await connect()
        }
      } catch (err) {
        console.error('Failed to restore wallet connection:', err)
        // Clear invalid connection state
        localStorage.removeItem('bsv_wallet_connected')
        localStorage.removeItem('bsv_wallet_address')
      } finally {
        setState(prev => ({ ...prev, isLoading: false }))
      }
    }
    
    checkExistingConnection()
  }, [connect])

  // Refresh balance periodically
  useEffect(() => {
    if (!state.isConnected || !state.wallet) {
      return
    }
    
    const interval = setInterval(refreshBalance, 60000) // Every minute
    return () => clearInterval(interval)
  }, [state.isConnected, state.wallet, refreshBalance])

  return {
    ...state,
    connect,
    disconnect,
    refreshBalance,
  }
}