import { QueryClient, QueryFunction } from "@tanstack/react-query";
import auth from "./auth"; // Временная заглушка аутентификации

const API_BASE_URL = import.meta.env.VITE_API_URL || "";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const headers: Record<string, string> = {};
  
  if (data) {
    headers["Content-Type"] = "application/json";
  }

  // Add auth token if available
  if (auth.authenticated && auth.token) {
    headers["Authorization"] = `Bearer ${auth.token}`;
  }

  const res = await fetch(`${API_BASE_URL}${url}`, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
  });

  // Handle authentication errors
  if (res.status === 401) {
    auth.logout();
    window.location.reload(); // Force re-authentication
  }

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const headers: Record<string, string> = {};

    // Add auth token if available
    if (auth.authenticated && auth.token) {
      headers["Authorization"] = `Bearer ${auth.token}`;
    }

    const res = await fetch(`${API_BASE_URL}${queryKey[0] as string}`, {
      headers,
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    // Handle authentication errors
    if (res.status === 401) {
      if (unauthorizedBehavior === "returnNull") {
        return null;
      }
      auth.logout();
      window.location.reload(); // Force re-authentication
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
