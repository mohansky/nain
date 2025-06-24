// src/lib/auth-client.ts
import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || 'http://localhost:3000',
});

export const {
  signUp,
  signIn,
  signOut,
  useSession,
  getSession,
} = authClient;

// Enhanced session refresh function
export const refreshSession = async () => {
  try {
    console.log("🔄 Refreshing session...");
    
    // Method 1: Try to force refresh with different cache settings
    await authClient.getSession({ 
      query: { 
        disableCookieCache: true,
        disableRefresh: false
      },
      fetchOptions: {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    });
    
    console.log("✅ Session refresh completed");
  } catch (error) {
    console.error('❌ Failed to refresh session:', error);
    throw error;
  }
};

// Alternative method - force a complete session reload
export const forceSessionReload = async () => {
  try {
    console.log("🔄 Force reloading session...");
    
    // Clear any cached data and force a fresh fetch
    await authClient.getSession({ 
      query: { 
        disableCookieCache: true 
      },
      fetchOptions: {
        method: 'GET',
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      }
    });
    
    // Small delay to ensure the session propagates
    await new Promise(resolve => setTimeout(resolve, 200));
    
    console.log("✅ Session force reload completed");
  } catch (error) {
    console.error('❌ Failed to force reload session:', error);
    throw error;
  }
};