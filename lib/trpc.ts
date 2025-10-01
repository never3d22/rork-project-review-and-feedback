import { createTRPCReact } from "@trpc/react-query";
import { httpLink } from "@trpc/client";
import type { AppRouter } from "@/backend/trpc/app-router";
import superjson from "superjson";

export const trpc = createTRPCReact<AppRouter>();

const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    const currentUrl = window.location.origin;
    console.log('🌐 Running on web, using current origin:', currentUrl);
    return currentUrl;
  }
  
  const baseUrl = process.env.EXPO_PUBLIC_RORK_API_BASE_URL;
  
  if (!baseUrl) {
    console.error("EXPO_PUBLIC_RORK_API_BASE_URL is not set");
    return "https://rork-project-review-and-feedback-3ukzrxnx5.vercel.app";
  }
  
  console.log('📱 Running on mobile, using env URL:', baseUrl);
  return baseUrl;
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
