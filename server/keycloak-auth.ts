import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

export interface KeycloakUser {
  sub: string; // Subject (user ID in Keycloak)
  preferred_username: string;
  given_name?: string;
  family_name?: string;
  email?: string;
  realm_access?: {
    roles: string[];
  };
  resource_access?: {
    [key: string]: {
      roles: string[];
    };
  };
}

export interface AuthenticatedRequest extends Request {
  user?: KeycloakUser;
  userId?: number; // Mapped from Keycloak sub to local user ID
}

// Configuration for Keycloak
const KEYCLOAK_REALM_URL = process.env.KEYCLOAK_REALM_URL;
const KEYCLOAK_CLIENT_ID = process.env.KEYCLOAK_CLIENT_ID;

// JWKS client for public key verification (when using Keycloak's public keys)
let jwksClientInstance: jwksClient.JwksClient | null = null;

if (KEYCLOAK_REALM_URL) {
  jwksClientInstance = jwksClient({
    jwksUri: `${KEYCLOAK_REALM_URL}/protocol/openid_connect/certs`,
    cache: true,
    cacheMaxAge: 600000, // 10 minutes
  });
}

// Get signing key for JWT verification
const getSigningKey = async (kid: string): Promise<string> => {
  if (!jwksClientInstance) {
    throw new Error('JWKS client not initialized');
  }
  
  const key = await jwksClientInstance.getSigningKey(kid);
  return key.getPublicKey();
};

// Verify Keycloak JWT token
export const verifyKeycloakToken = async (token: string): Promise<KeycloakUser | null> => {
  try {
    // For development/testing, allow simple verification with shared secret
    if (process.env.NODE_ENV === 'development' && process.env.JWT_SECRET) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET) as any;
        return decoded;
      } catch {
        // Fall through to Keycloak verification
      }
    }

    // Decode token header to get kid (key ID)
    const decoded = jwt.decode(token, { complete: true });
    if (!decoded || typeof decoded === 'string' || !decoded.header.kid) {
      return null;
    }

    // Get the signing key from Keycloak
    const signingKey = await getSigningKey(decoded.header.kid);
    
    // Verify the token
    const payload = jwt.verify(token, signingKey, {
      audience: KEYCLOAK_CLIENT_ID,
      issuer: KEYCLOAK_REALM_URL,
    }) as KeycloakUser;

    return payload;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
};

// Extract user ID from Keycloak subject
// This function maps Keycloak's 'sub' to your local user ID
// You may need to customize this based on your user mapping strategy
export const mapKeycloakUserToLocalId = (keycloakUser: KeycloakUser): number => {
  // Option 1: Use a simple hash of the sub to generate consistent ID
  let hash = 0;
  const str = keycloakUser.sub;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash) % 1000000; // Ensure positive and reasonable range

  // Option 2: If you have a user mapping table, query it here
  // return await storage.getUserIdByKeycloakSub(keycloakUser.sub);
  
  // Option 3: Use a numeric part of the sub if it's predictable
  // const match = keycloakUser.sub.match(/\d+/);
  // return match ? parseInt(match[0]) : 1;
};

// Authentication middleware for Keycloak
export const authenticateKeycloak = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'UNAUTHORIZED',
        message: 'Bearer token required' 
      });
    }

    const token = authHeader.substring(7);
    const user = await verifyKeycloakToken(token);

    if (!user) {
      return res.status(401).json({ 
        error: 'INVALID_TOKEN',
        message: 'Invalid or expired token' 
      });
    }

    // Map Keycloak user to local user ID
    const localUserId = mapKeycloakUserToLocalId(user);
    
    req.user = user;
    req.userId = localUserId;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ 
      error: 'AUTH_ERROR',
      message: 'Authentication failed' 
    });
  }
};

// Optional middleware to make authentication flexible (for development)
export const optionalAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    // If token is provided, verify it
    await authenticateKeycloak(req, res, next);
  } else {
    // If no token, allow through but without user context
    next();
  }
};

// Middleware to check for specific Keycloak roles
export const requireRole = (requiredRole: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'UNAUTHORIZED',
        message: 'Authentication required' 
      });
    }

    const userRoles = req.user.realm_access?.roles || [];
    if (!userRoles.includes(requiredRole)) {
      return res.status(403).json({ 
        error: 'FORBIDDEN',
        message: `Role '${requiredRole}' required` 
      });
    }

    next();
  };
};