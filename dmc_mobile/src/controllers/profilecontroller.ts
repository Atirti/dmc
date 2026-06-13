import { useMemo, useState } from "react";
import { ThemePreference } from "../../styles/themes";
import { getProfileMenuItems, ProfileMenuAction } from "../models/profilemenumodel";
import { AuthState, guestAuthState, initialAuthState, placeholderUser } from "../models/usermodel";
import { useAppTheme } from "./themecontroller";


export function useProfileController() {
    const {
        theme,
        themePreference,
        setThemePreference,
        resolvedThemeName,
    } = useAppTheme();

    const [authState, setAuthState] =
        useState<AuthState>(initialAuthState);
    const [isMenuVisible, setIsMenuVisible] = useState(false);
    const [isSettingsVisible, setIsSettingsVisible] = useState(false);
    const [infoMessage, setInfoMessage] = useState<string | null>(null);
    const menuItems = useMemo(
        () => getProfileMenuItems(authState.isAuthenticated),
        [authState.isAuthenticated]
    );

    function openMenu() {
        setIsMenuVisible(true);
    }

    function closeMenu() {
        setIsMenuVisible(false);
    }

    function openSettings() {
        closeMenu();
        setIsSettingsVisible(true);
    }

    function closeSettings() {
        setIsSettingsVisible(false);
    }

    function selectTheme(preference: ThemePreference) {
        setThemePreference(preference);
    }

    function login() {
        // TODO заменить на restapi авторизацию
        setAuthState({
            isAuthenticated: true,
            user: placeholderUser,
        });

        setInfoMessage("placeholder");
    }

    function register() {
        // TODO заменить на экран регистрации или rest api
        setInfoMessage("placeholder");
    }

    function logout() {
        // TODO заменить на restapi logout
        setAuthState(guestAuthState);
        setInfoMessage("placeholder");
    }

    function logoutAll() {
        // TODO заменить на restapi logout-all-devices
        setAuthState(guestAuthState);
        setInfoMessage("placeholder");
    }

    function handleMenuAction(action: ProfileMenuAction) {
        switch (action) {
            case "settings":
                openSettings();
                return;

            case "logout":
                closeMenu();
                logout();
                return;

            case "logoutAll":
                closeMenu();
                logoutAll();
                return;

            default:
                closeMenu();
        }
    }


    return {
        theme,
        authState,
        menuItems,
        isMenuVisible,
        isSettingsVisible,
        themePreference,
        resolvedThemeName,
        infoMessage,

        openMenu,
        closeMenu,
        closeSettings,
        selectTheme,
        handleMenuAction,
        login,
        register,
    };
}