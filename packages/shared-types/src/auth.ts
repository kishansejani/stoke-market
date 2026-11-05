export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'ANALYST' | 'PRO_USER' | 'FREE_USER';

export interface UserProfile {
  id: string;
  userId: string;
  theme: 'DARK' | 'LIGHT' | 'SYSTEM';
  preferredCurrency: 'INR' | 'USD';
  defaultMarket: 'IN' | 'US' | 'ALL';
  timezone: string;
  avatarUrl?: string;
  bio?: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isEmailVerified: boolean;
  status: 'ACTIVE' | 'SUSPENDED' | 'PENDING_VERIFICATION';
  roles: UserRole[];
  profile?: UserProfile;
  createdAt: string;
  updatedAt: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // in seconds
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

export interface JwtPayload {
  sub: string; // user id
  email: string;
  roles: UserRole[];
  iat?: number;
  exp?: number;
}
