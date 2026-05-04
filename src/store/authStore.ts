import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Broker } from '../types'
import { authApi } from '../services/api'

interface AuthState {
  broker: Broker | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: { name: string; email: string; password: string; licenseNumber: string; agency: string }) => Promise<void>
  logout: () => Promise<void>
  checkSession: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      broker: null,
      isAuthenticated: false,

      login: async (email, password) => {
        const broker = await authApi.login(email, password)
        set({ broker, isAuthenticated: true })
      },

      register: async (data) => {
        const broker = await authApi.register(data)
        set({ broker, isAuthenticated: true })
      },

      logout: async () => {
        try { await authApi.logout() } catch { /* ignore network errors on logout */ }
        set({ broker: null, isAuthenticated: false })
      },

      checkSession: async () => {
        try {
          const broker = await authApi.me()
          set({ broker, isAuthenticated: true })
        } catch {
          set({ broker: null, isAuthenticated: false })
        }
      },
    }),
    { name: 'smartquote-auth' },
  ),
)
