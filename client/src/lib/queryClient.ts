import { QueryClient, QueryFunction } from "@tanstack/react-query";
import keycloak from "./keycloak";

const API_BASE_URL = "http://localhost:8080/api";

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

  // Add Keycloak token if authenticated
  if (keycloak.authenticated && keycloak.token) {
    headers["Authorization"] = `Bearer ${keycloak.token}`;
  }

  const res = await fetch(`${API_BASE_URL}${url}`, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
  });

  // Handle token refresh if expired
  if (res.status === 401 && keycloak.authenticated) {
    try {
      await keycloak.updateToken(30);
      // Retry with new token
      headers["Authorization"] = `Bearer ${keycloak.token}`;
      const retryRes = await fetch(`${API_BASE_URL}${url}`, {
        method,
        headers,
        body: data ? JSON.stringify(data) : undefined,
      });
      await throwIfResNotOk(retryRes);
      return retryRes;
    } catch (error) {
      // Force login if refresh failed
      keycloak.login();
      throw new Error("401: Unauthorized");
    }
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

    // Add Keycloak token if authenticated
    if (keycloak.authenticated && keycloak.token) {
      headers["Authorization"] = `Bearer ${keycloak.token}`;
    }

    const res = await fetch(`${API_BASE_URL}${queryKey[0] as string}`, {
      headers,
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    // Handle token refresh if expired
    if (res.status === 401 && keycloak.authenticated) {
      try {
        await keycloak.updateToken(30);
        // Retry with new token
        headers["Authorization"] = `Bearer ${keycloak.token}`;
        const retryRes = await fetch(`${API_BASE_URL}${queryKey[0] as string}`, {
          headers,
        });
        
        if (unauthorizedBehavior === "returnNull" && retryRes.status === 401) {
          return null;
        }
        
        await throwIfResNotOk(retryRes);
        return await retryRes.json();
      } catch (error) {
        if (unauthorizedBehavior === "returnNull") {
          return null;
        }
        // Force login if refresh failed
        keycloak.login();
        throw new Error("401: Unauthorized");
      }
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
