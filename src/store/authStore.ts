import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Broker } from '../types'
import { mockBroker } from '../services/mockData'

interface AuthState {
  broker: Broker | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      broker: null,
      isAuthenticated: false,

      login: async (email: string) => {
        await new Promise((r) => setTimeout(r, 800))
        // In production this would call the real auth API
        const emailParts = email.split('@')
        if (emailParts.length !== 2 || !emailParts[1].includes('.')) throw new Error('Invalid credentials')
        set({ broker: { ...mockBroker, email }, isAuthenticated: true })
      },

      logout: () => {
        set({ broker: null, isAuthenticated: false })
      },
    }),
    { name: 'smartquote-auth' },
  ),
)
