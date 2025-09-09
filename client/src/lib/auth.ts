// Временная заглушка для аутентификации до настройки Keycloak
export interface User {
  id: string;
  username: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
}

// Callbacks for state changes
let authCallbacks: Array<(user: User | null) => void> = [];

// Mock authentication state - stored in localStorage for persistence
function getCurrentUser(): User | null {
  try {
    const userData = localStorage.getItem("mockUser");
    return userData ? JSON.parse(userData) : null;
  } catch {
    return null;
  }
}

function getCurrentToken(): string | null {
  return localStorage.getItem("mockToken");
}

function setUserData(user: User | null, token: string | null) {
  if (user && token) {
    localStorage.setItem("mockUser", JSON.stringify(user));
    localStorage.setItem("mockToken", token);
  } else {
    localStorage.removeItem("mockUser");
    localStorage.removeItem("mockToken");
  }
  
  // Notify all callbacks about state change
  authCallbacks.forEach(callback => callback(user));
}

export const auth = {
  // Check if user is authenticated
  get authenticated() {
    return getCurrentUser() !== null;
  },

  // Get current user
  get user() {
    return getCurrentUser();
  },

  // Get auth token
  get token() {
    return getCurrentToken();
  },

  // Mock login
  async login(): Promise<User> {
    // Simulate login process
    const user: User = {
      id: "mock-user-1",
      username: "Тест Пользователь",
      email: "user@example.com",
      firstName: "Тест",
      lastName: "Пользователь",
    };
    const token = "mock-jwt-token";
    
    setUserData(user, token);
    return user;
  },

  // Mock logout
  logout() {
    setUserData(null, null);
  },

  // Initialize auth (placeholder)
  async init() {
    return Promise.resolve();
  },

  // Subscribe to auth state changes
  onAuthChange(callback: (user: User | null) => void) {
    authCallbacks.push(callback);
    return () => {
      authCallbacks = authCallbacks.filter(cb => cb !== callback);
    };
  }
};

export default auth;