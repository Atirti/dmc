export const COLORS = {
    buttercream: "#D1CFC9",
    deepNavy: "#0F1A2B",

    surface: "#0F1A2B",
    surfaceContainer: "#142238",

    activeIndicator: "rgba(209, 207, 201, 0.18)",
    activeIcon: "#D1CFC9",
    inactiveIcon: "rgba(209, 207, 201, 0.62)",

    border: "rgba(209, 207, 201, 0.12)",
    textPrimary: "#D1CFC9",
    textSecondary: "rgba(209, 207, 201, 0.7)",
} as const;

export type AppColor = keyof typeof COLORS;