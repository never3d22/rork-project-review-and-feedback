import { createTRPCReact } from "@trpc/react-query";
import { httpLink } from "@trpc/client";
import type { AppRouter } from "@/backend/trpc/app-router";
import superjson from "superjson";

export const trpc = createTRPCReact<AppRouter>();

const getBaseUrl = () => {
  const envUrl = process.env.EXPO_PUBLIC_RORK_API_BASE_URL;
  
  if (envUrl && envUrl.trim()) {
    console.log('🔑 Using EXPO_PUBLIC_RORK_API_BASE_URL:', envUrl);
    return envUrl;
  }
  
  if (typeof window !== 'undefined') {
    const currentUrl = window.location.origin;
    console.log('🌐 Running on web, using current origin:', currentUrl);
    return currentUrl;
  }
  
  const fallbackUrl = "https://rork-project-review-and-feedback-3ukzrxnx5.vercel.app";
  console.error("⚠️ EXPO_PUBLIC_RORK_API_BASE_URL is not set, using fallback:", fallbackUrl);
  return fallbackUrl;
};

export const trpcClient = trpc.createClient({
  links: [
    httpLink({
      url: `${getBaseUrl()}/api/trpc`,
      transformer: superjson,
      fetch: (url, options) => {
        console.log('🌐 tRPC Request:', url);
        return fetch(url, {
          ...options,
          headers: {
            ...options?.headers,
            'Content-Type': 'application/json',
          },
        }).then(res => {
          console.log('📥 tRPC Response:', res.status, res.statusText);
          if (!res.ok) {
            console.error('❌ Response not OK:', res.status, res.statusText);
          }
          return res;
        }).catch(err => {
          console.error('❌ Fetch error:', err);
          throw err;
        });
      },
    }),
  ],
});
