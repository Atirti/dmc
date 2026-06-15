import React from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, TouchableWithoutFeedback, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { AppTheme, ThemePreference } from "../../styles/themes";
import { ProfileMenuItem } from "../models/profilemenumodel";
import { AuthState } from "../models/usermodel";

type ProfileViewProps = {
    theme: AppTheme;
    authState: AuthState;
    menuItems: ProfileMenuItem[];
    isMenuVisible: boolean;
    isSettingsVisible: boolean;
    themePreference: ThemePreference;
    resolvedThemeName: "light" | "dark";
    infoMessage: string | null;
    openMenu: () => void;
    closeMenu: () => void;
    closeSettings: () => void;
    selectTheme: (preference: ThemePreference) => void;
    handleMenuAction: (action: ProfileMenuItem["action"]) => void;
    login: () => void;
    register: () => void;
};

const themeOptions: Array<{
    value: ThemePreference;
    label: string;
    description: string;
    icon: keyof typeof MaterialCommunityIcons.glyphMap;
}> = [
    {
        value: "system",
        label: "Системная",
        description: "Использовать системную тему устройс",
        icon: "theme-light-dark",
    },
    {
        value: "light",
        label: "Светлая",
        description: "Светлый ui",
        icon: "white-balance-sunny",
    },
    {
        value: "dark",
        label: "Темная",
        description: "Темный ui",
        icon: "moon-waning-crescent",
    },
];

export function ProfileView(props: ProfileViewProps) {
    const { theme, authState, menuItems, isMenuVisible, isSettingsVisible, themePreference, resolvedThemeName, infoMessage, openMenu, closeMenu, closeSettings, selectTheme, handleMenuAction, login, register } = props;
    const styles = createStyles(theme);
    const displayName = authState.user?.username ?? authState.user?.name ?? "Гость";

    return (
        <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
            <TouchableWithoutFeedback
                onPress={closeMenu}
                disabled={!isMenuVisible}
            >
                <View style={styles.root}>
                    <View style={styles.header}>
                        <Text style={styles.screenTitle}>Профиль</Text>

                        <View style={styles.menuWrapper}>
                            <Pressable
                                accessibilityRole="button"
                                accessibilityLabel="Открыть меню профиля"
                                style={({ pressed }) => [
                                    styles.iconButton,
                                    pressed && styles.pressed,
                                ]}
                                onPress={isMenuVisible ? closeMenu : openMenu}
                            >
                                <MaterialCommunityIcons
                                    name="dots-vertical"
                                    size={26}
                                    color={theme.colors.text}
                                />
                            </Pressable>

                            {isMenuVisible && (
                                <View style={styles.dropdown}>
                                    {menuItems.map((item) => (
                                        <Pressable
                                            key={item.action}
                                            style={({ pressed }) => [
                                                styles.dropdownItem,
                                                pressed &&
                                                styles.dropdownItemPressed,
                                            ]}
                                            onPress={() =>
                                                handleMenuAction(item.action)
                                            }
                                        >
                                            <Text
                                                style={[
                                                    styles.dropdownText,
                                                    item.destructive &&
                                                    styles.dropdownTextDestructive,
                                                    item.bold &&
                                                    styles.dropdownTextBold,
                                                ]}
                                            >
                                                {item.label}
                                            </Text>
                                        </Pressable>
                                    ))}
                                </View>
                            )}
                        </View>
                    </View>

                    <ScrollView
                        contentContainerStyle={styles.content}
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={styles.profileCard}>
                            <View style={styles.avatarContainer}>
                                <MaterialCommunityIcons
                                    name="account-circle"
                                    size={theme.sizes.profileIcon}
                                    color={theme.colors.primary}
                                />
                            </View>

                            <Text style={styles.name}>{displayName}</Text>

                            <Text style={styles.status}>
                                {authState.isAuthenticated
                                    ? "Профиль активен"
                                    : "Войдите или зарегистрируйтесь, чтобы увидеть профиль"}
                            </Text>

                            {!authState.isAuthenticated ? (
                                <View style={styles.guestActions}>
                                    <Pressable
                                        accessibilityRole="button"
                                        style={({ pressed }) => [
                                            styles.primaryButton,
                                            pressed && styles.pressed,
                                        ]}
                                        onPress={login}
                                    >
                                        <Text style={styles.primaryButtonText}>
                                            Вход
                                        </Text>
                                    </Pressable>

                                    <Pressable
                                        accessibilityRole="button"
                                        style={({ pressed }) => [
                                            styles.secondaryButton,
                                            pressed && styles.pressed,
                                        ]}
                                        onPress={register}
                                    >
                                        <Text
                                            style={styles.secondaryButtonText}
                                        >
                                            Регистрация
                                        </Text>
                                    </Pressable>
                                </View>
                            ) : (
                                <View style={styles.placeholderBlock}>
                                    <PlaceholderRow
                                        theme={theme}
                                        icon="account-outline"
                                        label="Username"
                                        value={
                                            authState.user?.username ??
                                            authState.user?.name ??
                                            "Не указан"
                                        }
                                    />
                                    <PlaceholderRow
                                        theme={theme}
                                        icon="identifier"
                                        label="ID пользователя"
                                        value={
                                            authState.user?.id ??
                                            "Не указан"
                                        }
                                    />
                                </View>
                            )}
                        </View>

                        {infoMessage && (
                            <View style={styles.infoBanner}>
                                <MaterialCommunityIcons
                                    name="information-outline"
                                    size={20}
                                    color={theme.colors.primary}
                                />

                                <Text style={styles.infoText}>
                                    {infoMessage}
                                </Text>
                            </View>
                        )}
                    </ScrollView>

                    <SettingsModal
                        theme={theme}
                        visible={isSettingsVisible}
                        themePreference={themePreference}
                        resolvedThemeName={resolvedThemeName}
                        onSelectTheme={selectTheme}
                        onClose={closeSettings}
                    />
                </View>
            </TouchableWithoutFeedback>
        </SafeAreaView>
    );
}

type PlaceholderRowProps = { theme: AppTheme; icon: keyof typeof MaterialCommunityIcons.glyphMap; label: string; value: string; };

function PlaceholderRow({ theme, icon, label, value }: PlaceholderRowProps) {
    const styles = createStyles(theme);

    return (
        <View style={styles.placeholderRow}>
            <View style={styles.placeholderIcon}>
                <MaterialCommunityIcons
                    name={icon}
                    size={22}
                    color={theme.colors.primary}
                />
            </View>

            <View style={styles.placeholderTextBlock}>
                <Text style={styles.placeholderLabel}>{label}</Text>
                <Text style={styles.placeholderValue}>{value}</Text>
            </View>
        </View>
    );
}

type SettingsModalProps = {
    theme: AppTheme;
    visible: boolean;
    themePreference: ThemePreference;
    resolvedThemeName: "light" | "dark";
    onSelectTheme: (preference: ThemePreference) => void;
    onClose: () => void;
};

function SettingsModal({
                           theme,
                           visible,
                           themePreference,
                           resolvedThemeName,
                           onSelectTheme,
                           onClose,
                       }: SettingsModalProps) {
    const styles = createStyles(theme);

    return (
        <Modal
            animationType="fade"
            transparent
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.modalBackdrop}>
                <Pressable
                    style={StyleSheet.absoluteFill}
                    onPress={onClose}
                />

                <View style={styles.modalCard}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Настройки</Text>

                        <Pressable
                            accessibilityRole="button"
                            accessibilityLabel="Закрыть настройки"
                            style={({ pressed }) => [
                                styles.iconButton,
                                pressed && styles.pressed,
                            ]}
                            onPress={onClose}
                        >
                            <MaterialCommunityIcons
                                name="close"
                                size={24}
                                color={theme.colors.text}
                            />
                        </Pressable>
                    </View>

                    <Text style={styles.settingsCaption}>
                        Текущая тема:{" "}
                        {resolvedThemeName === "dark" ? "темная" : "светлая"}
                    </Text>

                    <View style={styles.themeOptions}>
                        {themeOptions.map((option) => {
                            const selected =
                                option.value === themePreference;

                            return (
                                <Pressable
                                    key={option.value}
                                    accessibilityRole="radio"
                                    accessibilityState={{ selected }}
                                    style={({ pressed }) => [
                                        styles.themeOption,
                                        selected &&
                                        styles.themeOptionSelected,
                                        pressed && styles.pressed,
                                    ]}
                                    onPress={() =>
                                        onSelectTheme(option.value)
                                    }
                                >
                                    <View style={styles.themeOptionIcon}>
                                        <MaterialCommunityIcons
                                            name={option.icon}
                                            size={24}
                                            color={theme.colors.primary}
                                        />
                                    </View>

                                    <View
                                        style={styles.themeOptionTextBlock}
                                    >
                                        <Text
                                            style={styles.themeOptionLabel}
                                        >
                                            {option.label}
                                        </Text>

                                        <Text
                                            style={
                                                styles.themeOptionDescription
                                            }
                                        >
                                            {option.description}
                                        </Text>
                                    </View>

                                    <MaterialCommunityIcons
                                        name={
                                            selected
                                                ? "radiobox-marked"
                                                : "radiobox-blank"
                                        }
                                        size={24}
                                        color={
                                            selected
                                                ? theme.colors.primary
                                                : theme.colors.outline
                                        }
                                    />
                                </Pressable>
                            );
                        })}
                    </View>
                </View>
            </View>
        </Modal>
    );
}

function createStyles(theme: AppTheme) {
    return StyleSheet.create({
        safeArea: {
            flex: 1,
            backgroundColor: theme.colors.background,
        },

        root: {
            flex: 1,
            backgroundColor: theme.colors.background,
        },

        header: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: theme.spacing.xl,
            paddingTop: 56,
            paddingBottom: theme.spacing.lg,
            zIndex: 2,
        },

        screenTitle: {
            ...theme.typography.titleLarge,
            color: theme.colors.text,
        },

        menuWrapper: {
            position: "relative",
            zIndex: 3,
        },

        iconButton: {
            width: 44,
            height: 44,
            borderRadius: theme.radius.round,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: theme.colors.surfaceContainer,
        },

        pressed: {
            opacity: 0.72,
        },

        dropdown: {
            position: "absolute",
            top: 52,
            right: 0,
            minWidth: 232,
            overflow: "hidden",
            borderRadius: theme.radius.md,
            backgroundColor: theme.colors.surface,
            borderWidth: 1,
            borderColor: theme.colors.divider,
            shadowColor: theme.colors.shadow,
            shadowOffset: {
                width: 0,
                height: 10,
            },
            shadowOpacity: 0.24,
            shadowRadius: 18,
            elevation: 12,
        },

        dropdownItem: {
            minHeight: 48,
            justifyContent: "center",
            paddingHorizontal: theme.spacing.lg,
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderBottomColor: theme.colors.divider,
        },

        dropdownItemPressed: {
            backgroundColor: theme.colors.surfaceVariant,
        },

        dropdownText: {
            ...theme.typography.bodyLarge,
            color: theme.colors.text,
        },

        dropdownTextDestructive: {
            color: theme.colors.error,
        },

        dropdownTextBold: {
            fontWeight: "800",
        },

        content: {
            paddingHorizontal: theme.spacing.xl,
            paddingBottom: theme.sizes.tabBarHeight + theme.spacing.xxl,
        },

        profileCard: {
            alignItems: "center",
            padding: theme.spacing.xl,
            borderRadius: theme.radius.xl,
            backgroundColor: theme.colors.surface,
            borderWidth: 1,
            borderColor: theme.colors.divider,
            shadowColor: theme.colors.shadow,
            shadowOffset: {
                width: 0,
                height: 12,
            },
            shadowOpacity: 0.18,
            shadowRadius: 20,
            elevation: 8,
        },

        avatarContainer: {
            width: 124,
            height: 124,
            borderRadius: theme.radius.round,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: theme.colors.primaryContainer,
            marginBottom: theme.spacing.lg,
        },

        name: {
            ...theme.typography.titleMedium,
            color: theme.colors.text,
            textAlign: "center",
        },

        status: {
            ...theme.typography.bodyMedium,
            color: theme.colors.textSecondary,
            textAlign: "center",
            marginTop: theme.spacing.sm,
        },

        guestActions: {
            width: "100%",
            gap: theme.spacing.md,
            marginTop: theme.spacing.xl,
        },

        primaryButton: {
            minHeight: 52,
            borderRadius: theme.radius.lg,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: theme.colors.primary,
            paddingHorizontal: theme.spacing.lg,
        },

        primaryButtonText: {
            ...theme.typography.labelLarge,
            color: theme.colors.onPrimary,
        },

        secondaryButton: {
            minHeight: 52,
            borderRadius: theme.radius.lg,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: theme.colors.primaryContainer,
            paddingHorizontal: theme.spacing.lg,
            borderWidth: 1,
            borderColor: theme.colors.primary,
        },

        secondaryButtonText: {
            ...theme.typography.labelLarge,
            color: theme.colors.primary,
        },

        placeholderBlock: {
            width: "100%",
            gap: theme.spacing.md,
            marginTop: theme.spacing.xl,
        },

        placeholderRow: {
            flexDirection: "row",
            alignItems: "center",
            gap: theme.spacing.md,
            padding: theme.spacing.md,
            borderRadius: theme.radius.md,
            backgroundColor: theme.colors.surfaceContainer,
        },

        placeholderIcon: {
            width: 42,
            height: 42,
            borderRadius: theme.radius.round,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: theme.colors.primaryContainer,
        },

        placeholderTextBlock: {
            flex: 1,
        },

        placeholderLabel: {
            ...theme.typography.bodyMedium,
            color: theme.colors.textSecondary,
        },

        placeholderValue: {
            ...theme.typography.bodyLarge,
            color: theme.colors.text,
            marginTop: 2,
        },

        infoBanner: {
            flexDirection: "row",
            alignItems: "center",
            gap: theme.spacing.sm,
            marginTop: theme.spacing.lg,
            padding: theme.spacing.md,
            borderRadius: theme.radius.md,
            backgroundColor: theme.colors.primaryContainer,
        },

        infoText: {
            ...theme.typography.bodyMedium,
            flex: 1,
            color: theme.colors.text,
        },

        modalBackdrop: {
            flex: 1,
            justifyContent: "flex-end",
            backgroundColor: "rgba(0, 0, 0, 0.48)",
        },

        modalCard: {
            padding: theme.spacing.xl,
            paddingBottom: theme.spacing.xxl,
            borderTopLeftRadius: theme.radius.xl,
            borderTopRightRadius: theme.radius.xl,
            backgroundColor: theme.colors.surface,
        },

        modalHeader: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: theme.spacing.sm,
        },

        modalTitle: {
            ...theme.typography.titleMedium,
            color: theme.colors.text,
        },

        settingsCaption: {
            ...theme.typography.bodyMedium,
            color: theme.colors.textSecondary,
            marginBottom: theme.spacing.lg,
        },

        themeOptions: {
            gap: theme.spacing.md,
        },

        themeOption: {
            minHeight: 72,
            flexDirection: "row",
            alignItems: "center",
            gap: theme.spacing.md,
            padding: theme.spacing.md,
            borderRadius: theme.radius.lg,
            backgroundColor: theme.colors.surfaceContainer,
            borderWidth: 1,
            borderColor: "transparent",
        },

        themeOptionSelected: {
            borderColor: theme.colors.primary,
            backgroundColor: theme.colors.primaryContainer,
        },

        themeOptionIcon: {
            width: 44,
            height: 44,
            borderRadius: theme.radius.round,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: theme.colors.surface,
        },

        themeOptionTextBlock: {
            flex: 1,
        },

        themeOptionLabel: {
            ...theme.typography.labelLarge,
            color: theme.colors.text,
        },

        themeOptionDescription: {
            ...theme.typography.bodyMedium,
            color: theme.colors.textSecondary,
            marginTop: 2,
        },
    });
}