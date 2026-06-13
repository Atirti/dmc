import React, { createContext, PropsWithChildren, useContext, useMemo, useState } from "react";
import { ColorSchemeName, useColorScheme } from "react-native";
import { AppTheme, ThemePreference, themes } from "../../styles/themes";

type ThemeContextValue = {
    theme: AppTheme;
    themePreference: ThemePreference;
    resolvedThemeName: "light" | "dark";
    setThemePreference: (preference: ThemePreference) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function resolveThemeName(
    preference: ThemePreference,
    systemScheme: ColorSchemeName
): "light" | "dark" {
    if (preference !== "system") {
        return preference;
    }

    return systemScheme === "light" ? "light" : "dark";
}

export function ThemeProvider({ children }: PropsWithChildren) {
    const systemScheme = useColorScheme();
    const [themePreference, setThemePreference] =
        useState<ThemePreference>("system");

    const resolvedThemeName = resolveThemeName(themePreference, systemScheme);

    const value = useMemo<ThemeContextValue>(
        () => ({
            theme: themes[resolvedThemeName],
            themePreference,
            resolvedThemeName,
            setThemePreference,
        }),
        [themePreference, resolvedThemeName]
    );

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useAppTheme() {
    const context = useContext(ThemeContext);

    if (!context) {
        throw new Error("useAppTheme must be used inside ThemeProvider");
    }

    return context;
}