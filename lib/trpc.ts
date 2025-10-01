import { createTRPCReact } from "@trpc/react-query";
import { httpLink } from "@trpc/client";
import type { AppRouter } from "@/backend/trpc/app-router";
import superjson from "superjson";

export const trpc = createTRPCReact<AppRouter>();

const getBaseUrl = () => {
  const envUrl = process.env.EXPO_PUBLIC_RORK_API_BASE_URL;
  
  console.log('\n========================================');
  console.log('🔵 [TRPC CLIENT] Getting base URL');
  console.log('========================================');
  console.log('EXPO_PUBLIC_RORK_API_BASE_URL:', envUrl || 'NOT SET');
  console.log('typeof window:', typeof window);
  
  if (envUrl && envUrl.trim()) {
    console.log('✅ Using EXPO_PUBLIC_RORK_API_BASE_URL:', envUrl);
    console.log('========================================\n');
    return envUrl;
  }
  
  if (typeof window !== 'undefined') {
    const currentUrl = window.location.origin;
    console.log('✅ Running on web, using current origin:', currentUrl);
    console.log('========================================\n');
    return currentUrl;
  }
  
  const fallbackUrl = "http://localhost:8081";
  console.error("⚠️ EXPO_PUBLIC_RORK_API_BASE_URL is not set and not running in browser, using fallback:", fallbackUrl);
  console.log('========================================\n');
  return fallbackUrl;
};

export const trpcClient = trpc.createClient({
  links: [
    httpLink({
      url: `${getBaseUrl()}/api/trpc`,
      transformer: superjson,
      fetch: async (url, options) => {
        console.log('\n========================================');
        console.log('🌐 [TRPC] Making request');
        console.log('========================================');
        console.log('URL:', url);
        console.log('Method:', options?.method || 'GET');
        console.log('Headers:', JSON.stringify(options?.headers, null, 2));
        
        try {
          const res = await fetch(url, {
            ...options,
            headers: {
              ...options?.headers,
              'Content-Type': 'application/json',
            },
          });
          
          console.log('📥 [TRPC] Response received');
          console.log('Status:', res.status, res.statusText);
          console.log('Headers:', JSON.stringify(Object.fromEntries(res.headers.entries()), null, 2));
          
          if (!res.ok) {
            const text = await res.text();
            console.error('❌ [TRPC] Response not OK');
            console.error('Status:', res.status);
            console.error('Body:', text.substring(0, 500));
          }
          
          console.log('========================================\n');
          return res;
        } catch (err) {
          console.error('\n========================================');
          console.error('❌ [TRPC] Fetch error');
          console.error('========================================');
          console.error('Error:', err);
          console.error('Error type:', typeof err);
          console.error('Error message:', err instanceof Error ? err.message : String(err));
          console.error('========================================\n');
          throw err;
        }
      },
    }),
  ],
});
