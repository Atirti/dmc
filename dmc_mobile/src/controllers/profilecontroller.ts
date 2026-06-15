import { useMemo, useState, useEffect } from "react";
import { router } from "expo-router";
import { setAudioModeAsync, useAudioPlayer } from "expo-audio";
import { ThemePreference } from "../../styles/themes";
import { getProfileMenuItems, ProfileMenuAction } from "../models/profilemenumodel";
import { useAppTheme } from "./themecontroller";
import { useAuth } from "./authcontroller";

export function useProfileController() {
    const {
        theme,
        themePreference,
        setThemePreference,
        resolvedThemeName,
    } = useAppTheme();
    const { authState, logout: logoutRequest, errorMessage, authorizedRequest } = useAuth();

    const logoutAllSound = require("../../media/sound/wilhelms.mp3");
    const logoutAllSoundPlayer = useAudioPlayer(logoutAllSound);

    useEffect(() => {
        setAudioModeAsync({
            playsInSilentMode: true,
        });
    }, []);

    const [isMenuVisible, setIsMenuVisible] = useState(false);
    const [isSettingsVisible, setIsSettingsVisible] = useState(false);
    const [infoMessage, setInfoMessage] = useState<string | null>(null);
    const menuItems = useMemo(
        () => getProfileMenuItems(authState.isAuthenticated),
        [authState.isAuthenticated]
    );

    useEffect(() => {
        if (authState.isAuthenticated) {
            setInfoMessage("Вы вошли в аккаунт");
        }
    }, [authState.isAuthenticated]);

    useEffect(() => {
        if (errorMessage) {
            setInfoMessage(errorMessage);
        }
    }, [errorMessage]);

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
        router.push("/login" as never);
    }

    function register() {
        router.push("/registration" as never);
    }

    async function logout() {
        await logoutRequest();
        setInfoMessage("Вы вышли из аккаунта");
    }

    async function logoutAll() {
        logoutAllSoundPlayer.seekTo(0);
        logoutAllSoundPlayer.play();
        await authorizedRequest<unknown>("/logout_everywhere", { method: "DELETE" });
        await logoutRequest();
        setInfoMessage("Вы вышли из аккаунта на всех устройствах");
    }

    function handleMenuAction(action: ProfileMenuAction) {
        switch (action) {
            case "settings":
                openSettings();
                return;

            case "logout":
                closeMenu();
                void logout();
                return;

            case "logoutAll":
                closeMenu();
                void logoutAll();
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
