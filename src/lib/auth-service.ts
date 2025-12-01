// Authentication Service using oidc-client-ts
import { UserManager, WebStorageStateStore, User } from 'oidc-client-ts'

const OIDC_AUTHORITY = import.meta.env.VITE_OIDC_AUTHORITY || ''
const OIDC_CLIENT_ID = import.meta.env.VITE_OIDC_CLIENT_ID || ''
const OIDC_REDIRECT_URI = import.meta.env.VITE_OIDC_REDIRECT_URI || `${window.location.origin}/auth-callback`
const OIDC_POST_LOGOUT_REDIRECT_URI = import.meta.env.VITE_OIDC_POST_LOGOUT_REDIRECT_URI || window.location.origin
const OIDC_SCOPE = import.meta.env.VITE_OIDC_SCOPE || 'openid profile email'

// Debug: Log environment variables for OIDC configuration
console.log('🔐 OIDC Configuration Debug:')
console.log('  VITE_OIDC_AUTHORITY:', OIDC_AUTHORITY || '❌ NOT SET')
console.log('  VITE_OIDC_CLIENT_ID:', OIDC_CLIENT_ID || '❌ NOT SET')
console.log('  VITE_OIDC_REDIRECT_URI:', OIDC_REDIRECT_URI)
console.log('  VITE_OIDC_POST_LOGOUT_REDIRECT_URI:', OIDC_POST_LOGOUT_REDIRECT_URI)
console.log('  VITE_OIDC_SCOPE:', OIDC_SCOPE)
console.log('  All env vars:', import.meta.env)

const userManagerSettings = {
  authority: OIDC_AUTHORITY,
  client_id: OIDC_CLIENT_ID,
  redirect_uri: OIDC_REDIRECT_URI,
  post_logout_redirect_uri: OIDC_POST_LOGOUT_REDIRECT_URI,
  scope: OIDC_SCOPE,
  response_type: 'code',
  userStore: new WebStorageStateStore({ store: window.localStorage }),
  automaticSilentRenew: true,
  silent_redirect_uri: `${window.location.origin}/auth/silent-callback`,
}

class AuthService {
  private userManager: UserManager
  private user: User | null = null

  constructor() {
    this.userManager = new UserManager(userManagerSettings)

    // Set up event listeners
    this.userManager.events.addUserLoaded((user) => {
      this.user = user
    })

    this.userManager.events.addUserUnloaded(() => {
      this.user = null
    })

    this.userManager.events.addAccessTokenExpired(() => {
      this.signinSilent()
    })

    this.userManager.events.addSilentRenewError((error) => {
      console.error('Silent renew error:', error)
    })
  }

  async getUser(): Promise<User | null> {
    if (this.user) {
      return this.user
    }
    this.user = await this.userManager.getUser()
    return this.user
  }

  async getAccessToken(): Promise<string | null> {
    const user = await this.getUser()
    return user?.access_token || null
  }

  async isAuthenticated(): Promise<boolean> {
    const user = await this.getUser()
    return !!user && !user.expired
  }

  async signinRedirect(): Promise<void> {
    await this.userManager.signinRedirect()
  }

  async signinCallback(): Promise<User> {
    const user = await this.userManager.signinCallback()
    this.user = user ?? null
    return user as User
  }

  async signinSilent(): Promise<User | null> {
    try {
      const user = await this.userManager.signinSilent()
      this.user = user ?? null
      return user ?? null
    } catch (error) {
      console.error('Silent signin error:', error)
      return null
    }
  }

  async signoutRedirect(): Promise<void> {
    await this.userManager.signoutRedirect()
  }

  async signoutCallback(): Promise<void> {
    await this.userManager.signoutCallback()
    this.user = null
  }

  getUserManager(): UserManager {
    return this.userManager
  }
}

// Export singleton instance
export const authService = new AuthService()

// Export types
export type { User }
