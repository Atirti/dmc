import { AuthTokens } from "./authmodel";

export type User = {
    id: string;
    username: string;
    name: string;
};

export type AuthState = {
    isAuthenticated: boolean;
    user: User | null;
    tokens: AuthTokens | null;
};

export const guestAuthState: AuthState = {
    isAuthenticated: false,
    user: null,
    tokens: null,
};

export const placeholderUser: User = {
    id: "placeholder-user-id",
    username: "user",
    name: "User Userovich",
};

export const USE_AUTH_PLACEHOLDER = false;

export const initialAuthState: AuthState = USE_AUTH_PLACEHOLDER
    ? {
          isAuthenticated: true,
          user: placeholderUser,
          tokens: null,
      }
    : guestAuthState;
