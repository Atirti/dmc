export const themes = {
    dark: {
        colors: {
            background: "#0F1115",
            surface: "#171A21",
            surfaceVariant: "#20242E",
            primary: "#BB86FC",
            primaryContainer: "rgba(187, 134, 252, 0.16)",
            text: "#F4F6FA",
            textSecondary: "#AEB4C0",
            tabBarBackground: "#171A21",
            tabBarBorder: "rgba(255, 255, 255, 0.08)",
            tabIconActive: "#BB86FC",
            tabIconInactive: "#8F96A3",
            tabLabelActive: "#F4F6FA",
            tabLabelInactive: "#8F96A3",
            shadow: "#000000",
        },

        spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24},
        radius: {sm: 8, md: 14, lg: 22, xl: 28},

        sizes: {
            tabBarHeight: 72,
            tabBarIcon: 26,
            tabBarActiveIcon: 28,
        },

        typography: {
            tabLabel: {
                fontSize: 12,
                fontWeight: "600" as const,
            },
        },
    },
};
export const theme = themes.dark;