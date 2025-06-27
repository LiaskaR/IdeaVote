// Временная заглушка для аутентификации до настройки Keycloak
export interface User {
  id: string;
  username: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
}

// Mock authentication state
let currentUser: User | null = null;
let authToken: string | null = null;

export const auth = {
  // Check if user is authenticated
  get authenticated() {
    return currentUser !== null;
  },

  // Get current user
  get user() {
    return currentUser;
  },

  // Get auth token
  get token() {
    return authToken;
  },

  // Mock login
  async login(): Promise<User> {
    // Simulate login process
    currentUser = {
      id: "mock-user-1",
      username: "Пользователь",
      email: "user@example.com",
      firstName: "Тест",
      lastName: "Пользователь",
    };
    authToken = "mock-jwt-token";
    return currentUser;
  },

  // Mock logout
  logout() {
    currentUser = null;
    authToken = null;
  },

  // Initialize auth (placeholder)
  async init() {
    return Promise.resolve();
  }
};

export default auth;