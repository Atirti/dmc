export type User = {
    id: string;
    name: string;
    email?: string;
    phone?: string;
};

export type AuthState = {
    isAuthenticated: boolean;
    user: User | null;
};

export const guestAuthState: AuthState = {
    isAuthenticated: false,
    user: null,
};

export const placeholderUser: User = {
    id: "placeholder-user-id",
    name: "User Userovich",
    email: "user@mail.com",
    phone: "+7 000 000-00-00",
};

// плейсхолдер до подтягивания апи
export const USE_AUTH_PLACEHOLDER = false;

export const initialAuthState: AuthState = USE_AUTH_PLACEHOLDER
    ? {
        isAuthenticated: true,
        user: placeholderUser,
    }
    : guestAuthState;