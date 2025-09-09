import React, { useState, useEffect } from "react";
import auth, { User } from "@/lib/auth";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        await auth.init();
        setUser(auth.user);
      } catch (error) {
        console.error("Auth initialization failed:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    // Subscribe to auth state changes
    const unsubscribe = auth.onAuthChange((newUser) => {
      setUser(newUser);
    });

    return unsubscribe;
  }, []);

  const login = async () => {
    setIsLoading(true);
    try {
      const loggedInUser = await auth.login();
      // State will be updated via the onAuthChange callback
    } catch (error) {
      console.error("Login failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    auth.logout();
    // State will be updated via the onAuthChange callback
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
  };
}