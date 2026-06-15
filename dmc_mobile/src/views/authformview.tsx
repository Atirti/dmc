import React from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { AppTheme } from "../../styles/themes";

type AuthFormViewProps = {
    theme: AppTheme;
    title: string;
    subtitle: string;
    submitLabel: string;
    username: string;
    password: string;
    confirmPassword?: string;
    showConfirmPassword?: boolean;
    isSubmitting: boolean;
    errorMessage: string | null;
    switchText: string;
    switchLabel: string;
    onChangeUsername: (value: string) => void;
    onChangePassword: (value: string) => void;
    onChangeConfirmPassword?: (value: string) => void;
    onSubmit: () => void;
    onSwitch: () => void;
    onBackToProfile: () => void;
};

export function AuthFormView(props: AuthFormViewProps) {
    const {
        theme,
        title,
        subtitle,
        submitLabel,
        username,
        password,
        confirmPassword,
        showConfirmPassword,
        isSubmitting,
        errorMessage,
        switchText,
        switchLabel,
        onChangeUsername,
        onChangePassword,
        onChangeConfirmPassword,
        onSubmit,
        onSwitch,
        onBackToProfile,
    } = props;
    const styles = createStyles(theme);

    return (
        <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                style={styles.keyboardRoot}
            >
                <ScrollView
                    contentContainerStyle={styles.content}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <Pressable
                        accessibilityRole="button"
                        style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
                        onPress={onBackToProfile}
                    >
                        <MaterialCommunityIcons
                            name="arrow-left"
                            size={24}
                            color={theme.colors.text}
                        />
                        <Text style={styles.backButtonText}>Профиль</Text>
                    </Pressable>

                    <View style={styles.card}>
                        <View style={styles.iconCircle}>
                            <MaterialCommunityIcons
                                name="shield-account-outline"
                                size={42}
                                color={theme.colors.primary}
                            />
                        </View>

                        <Text style={styles.title}>{title}</Text>
                        <Text style={styles.subtitle}>{subtitle}</Text>

                        <View style={styles.fieldGroup}>
                            <Text style={styles.label}>Логин</Text>
                            <TextInput
                                value={username}
                                onChangeText={onChangeUsername}
                                autoCapitalize="none"
                                autoCorrect={false}
                                placeholder="username"
                                placeholderTextColor={theme.colors.textSecondary}
                                style={styles.input}
                            />
                        </View>

                        <View style={styles.fieldGroup}>
                            <Text style={styles.label}>Пароль</Text>
                            <TextInput
                                value={password}
                                onChangeText={onChangePassword}
                                autoCapitalize="none"
                                autoCorrect={false}
                                secureTextEntry
                                placeholder="минимум 8 символов"
                                placeholderTextColor={theme.colors.textSecondary}
                                style={styles.input}
                            />
                        </View>

                        {showConfirmPassword && (
                            <View style={styles.fieldGroup}>
                                <Text style={styles.label}>Повтор пароля</Text>
                                <TextInput
                                    value={confirmPassword}
                                    onChangeText={onChangeConfirmPassword}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    secureTextEntry
                                    placeholder="повторите пароль"
                                    placeholderTextColor={theme.colors.textSecondary}
                                    style={styles.input}
                                />
                            </View>
                        )}

                        {errorMessage && (
                            <View style={styles.errorBox}>
                                <MaterialCommunityIcons
                                    name="alert-circle-outline"
                                    size={20}
                                    color={theme.colors.error}
                                />
                                <Text style={styles.errorText}>{errorMessage}</Text>
                            </View>
                        )}

                        <Pressable
                            accessibilityRole="button"
                            disabled={isSubmitting}
                            style={({ pressed }) => [
                                styles.submitButton,
                                isSubmitting && styles.submitButtonDisabled,
                                pressed && styles.pressed,
                            ]}
                            onPress={onSubmit}
                        >
                            {isSubmitting ? (
                                <ActivityIndicator color={theme.colors.onPrimary} />
                            ) : (
                                <Text style={styles.submitButtonText}>{submitLabel}</Text>
                            )}
                        </Pressable>

                        <View style={styles.switchRow}>
                            <Text style={styles.switchText}>{switchText}</Text>
                            <Pressable onPress={onSwitch}>
                                <Text style={styles.switchLink}>{switchLabel}</Text>
                            </Pressable>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

function createStyles(theme: AppTheme) {
    return StyleSheet.create({
        safeArea: {
            flex: 1,
            backgroundColor: theme.colors.background,
        },

        keyboardRoot: {
            flex: 1,
        },

        content: {
            flexGrow: 1,
            paddingHorizontal: theme.spacing.xl,
            paddingTop: theme.spacing.xl,
            paddingBottom: theme.sizes.tabBarHeight + theme.spacing.xxl,
            justifyContent: "center",
        },

        backButton: {
            alignSelf: "flex-start",
            flexDirection: "row",
            alignItems: "center",
            gap: theme.spacing.sm,
            minHeight: 44,
            paddingRight: theme.spacing.md,
            marginBottom: theme.spacing.lg,
        },

        backButtonText: {
            ...theme.typography.labelLarge,
            color: theme.colors.text,
        },

        card: {
            padding: theme.spacing.xl,
            borderRadius: theme.radius.xl,
            backgroundColor: theme.colors.surface,
            borderWidth: 1,
            borderColor: theme.colors.divider,
            shadowColor: theme.colors.shadow,
            shadowOffset: { width: 0, height: 12 },
            shadowOpacity: 0.18,
            shadowRadius: 20,
            elevation: 8,
        },

        iconCircle: {
            width: 84,
            height: 84,
            alignSelf: "center",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: theme.radius.round,
            backgroundColor: theme.colors.primaryContainer,
            marginBottom: theme.spacing.lg,
        },

        title: {
            ...theme.typography.titleLarge,
            color: theme.colors.text,
            textAlign: "center",
        },

        subtitle: {
            ...theme.typography.bodyMedium,
            color: theme.colors.textSecondary,
            textAlign: "center",
            marginTop: theme.spacing.sm,
            marginBottom: theme.spacing.xl,
        },

        fieldGroup: {
            marginBottom: theme.spacing.md,
        },

        label: {
            ...theme.typography.labelLarge,
            color: theme.colors.text,
            marginBottom: theme.spacing.xs,
        },

        input: {
            minHeight: 52,
            borderRadius: theme.radius.lg,
            borderWidth: 1,
            borderColor: theme.colors.divider,
            backgroundColor: theme.colors.surfaceContainer,
            color: theme.colors.text,
            paddingHorizontal: theme.spacing.md,
            ...theme.typography.bodyLarge,
        },

        errorBox: {
            flexDirection: "row",
            alignItems: "flex-start",
            gap: theme.spacing.sm,
            padding: theme.spacing.md,
            borderRadius: theme.radius.md,
            backgroundColor: theme.colors.surfaceContainer,
            borderWidth: 1,
            borderColor: theme.colors.error,
            marginVertical: theme.spacing.md,
        },

        errorText: {
            ...theme.typography.bodyMedium,
            flex: 1,
            color: theme.colors.error,
        },

        submitButton: {
            minHeight: 54,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: theme.radius.lg,
            backgroundColor: theme.colors.primary,
            marginTop: theme.spacing.sm,
        },

        submitButtonDisabled: {
            opacity: 0.62,
        },

        submitButtonText: {
            ...theme.typography.labelLarge,
            color: theme.colors.onPrimary,
        },

        switchRow: {
            flexDirection: "row",
            justifyContent: "center",
            gap: theme.spacing.xs,
            marginTop: theme.spacing.lg,
        },

        switchText: {
            ...theme.typography.bodyMedium,
            color: theme.colors.textSecondary,
        },

        switchLink: {
            ...theme.typography.labelLarge,
            color: theme.colors.primary,
        },

        pressed: {
            opacity: 0.72,
        },
    });
}
