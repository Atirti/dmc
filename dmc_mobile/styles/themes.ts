export type AppThemeName = "light" | "dark";
export type ThemePreference = AppThemeName | "system";

const base = {
    spacing: {
        xs: 4,
        sm: 8,
        md: 12,
        lg: 16,
        xl: 24,
        xxl: 32,
    },

    radius: {
        sm: 8,
        md: 14,
        lg: 22,
        xl: 28,
        round: 999,
    },

    sizes: {
        tabBarHeight: 72,
        tabBarIcon: 26,
        tabBarActiveIcon: 28,
        profileIcon: 104,
    },

    typography: {
        tabLabel: {
            fontSize: 12,
            fontWeight: "600" as const,
        },

        titleLarge: {
            fontSize: 28,
            lineHeight: 34,
            fontWeight: "700" as const,
        },

        titleMedium: {
            fontSize: 20,
            lineHeight: 26,
            fontWeight: "700" as const,
        },

        bodyLarge: {
            fontSize: 16,
            lineHeight: 24,
            fontWeight: "400" as const,
        },

        bodyMedium: {
            fontSize: 14,
            lineHeight: 20,
            fontWeight: "400" as const,
        },

        labelLarge: {
            fontSize: 14,
            lineHeight: 20,
            fontWeight: "700" as const,
        },
    },
};

export const themes = {
    light: {
        ...base,
        name: "light" as const,

        colors: {
            background: "#FFFBFE",
            surface: "#FFFFFF",
            surfaceVariant: "#E7E0EC",
            surfaceContainer: "#F3EDF7",
            inputBackground: "#F7F2FA",
            inputBorder: "rgba(29, 27, 32, 0.16)",
            inputBorderFocused: "#6750A4",

            primary: "#6750A4",
            onPrimary: "#FFFFFF",
            primaryContainer: "#EADDFF",
            onPrimaryContainer: "#21005D",
            text: "#1D1B20",
            textSecondary: "#49454F",
            outline: "#79747E",
            divider: "rgba(29, 27, 32, 0.12)",
            error: "#B3261E",
            onError: "#FFFFFF",
            errorContainer: "#F9DEDC",
            success: "#146C2E",
            successContainer: "#D7F8DD",
            warning: "#7A4D00",
            warningContainer: "#FFEBC2",
            disabled: "rgba(29, 27, 32, 0.38)",
            overlay: "rgba(0, 0, 0, 0.42)",
            tabBarBackground: "#FFFFFF",
            tabBarBorder: "rgba(29, 27, 32, 0.12)",
            tabIconActive: "#6750A4",
            tabIconInactive: "#79747E",
            tabLabelActive: "#1D1B20",
            tabLabelInactive: "#79747E",
            shadow: "#000000",
        },
    },

    dark: {
        ...base,
        name: "dark" as const,

        colors: {
            background: "#0F1115",
            surface: "#171A21",
            surfaceVariant: "#20242E",
            surfaceContainer: "#242832",

            inputBackground: "#20242E",
            inputBorder: "rgba(255, 255, 255, 0.12)",
            inputBorderFocused: "#BB86FC",

            primary: "#BB86FC",
            onPrimary: "#1F1235",
            primaryContainer: "rgba(187, 134, 252, 0.16)",
            onPrimaryContainer: "#EADDFF",

            text: "#F4F6FA",
            textSecondary: "#AEB4C0",

            outline: "#8F96A3",
            divider: "rgba(255, 255, 255, 0.08)",

            error: "#FFB4AB",
            onError: "#690005",
            errorContainer: "rgba(255, 180, 171, 0.14)",
            success: "#7DDA92",
            successContainer: "rgba(125, 218, 146, 0.16)",
            warning: "#FFD27D",
            warningContainer: "rgba(255, 210, 125, 0.16)",
            disabled: "rgba(255, 255, 255, 0.38)",
            overlay: "rgba(0, 0, 0, 0.62)",

            tabBarBackground: "#171A21",
            tabBarBorder: "rgba(255, 255, 255, 0.08)",
            tabIconActive: "#BB86FC",
            tabIconInactive: "#8F96A3",
            tabLabelActive: "#F4F6FA",
            tabLabelInactive: "#8F96A3",

            shadow: "#000000",
        },
    },
};

export type AppTheme = (typeof themes)[AppThemeName];
export const theme = themes.dark;