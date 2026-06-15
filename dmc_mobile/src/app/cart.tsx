import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useAppTheme } from "../controllers/themecontroller";
import { useAuth } from "../controllers/authcontroller";
import { Address, CartItem } from "../models/productmodel";
import { createOrder, deleteCartProduct, getCart, setCartProductCount } from "../services/shopapi";
import { AppTheme } from "../../styles/themes";

const emptyAddress: Address = {
    street: "",
    house_num: "",
    apartament: "",
};

export default function Cart() {
    const { theme } = useAppTheme();
    const styles = createStyles(theme);
    const { authState, authorizedRequest } = useAuth();
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [updatingProductId, setUpdatingProductId] = useState<number | null>(null);
    const [isCheckoutVisible, setIsCheckoutVisible] = useState(false);
    const [address, setAddress] = useState<Address>(emptyAddress);
    const [message, setMessage] = useState<string | null>(null);

    const totalPrice = useMemo(
        () => cartItems.reduce((sum, item) => sum + item.price * item.countInCart, 0),
        [cartItems]
    );

    const loadCart = useCallback(async (refresh = false) => {
        if (!authState.isAuthenticated) {
            setCartItems([]);
            return;
        }

        refresh ? setIsRefreshing(true) : setIsLoading(true);
        setMessage(null);

        try {
            const loadedCart = await getCart(authorizedRequest);
            setCartItems(loadedCart);

            if (loadedCart.length === 0) {
                setMessage("Корзина пуста. Добавьте товары на главной странице.");
            }
        } catch (error) {
            setCartItems([]);
            setMessage(
                error instanceof Error
                    ? error.message
                    : "Не удалось загрузить корзину"
            );
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, [authState.isAuthenticated, authorizedRequest]);

    useEffect(() => {
        void loadCart();
    }, [loadCart]);

    async function handleRemove(product: CartItem) {
        setUpdatingProductId(product.id);
        setMessage(null);

        try {
            const updatedCart = product.countInCart > 1
                ? await setCartProductCount(authorizedRequest, product.id, product.countInCart - 1)
                : await deleteCartProduct(authorizedRequest, product.id);
            setCartItems(updatedCart);
            setMessage(`«${product.title}» удалён из корзины`);
        } catch (error) {
            setMessage(
                error instanceof Error
                    ? error.message
                    : "Не удалось удалить товар из корзины"
            );
        } finally {
            setUpdatingProductId(null);
        }
    }

    async function handleCheckout() {
        if (cartItems.length === 0) {
            setMessage("Корзина пустая");
            return;
        }

        if (!address.street.trim() || !address.house_num.trim()) {
            setMessage("Заполните улицу и номер дома");
            return;
        }

        setIsLoading(true);
        setMessage(null);

        try {
            const result = await createOrder(authorizedRequest, cartItems, {
                street: address.street.trim(),
                house_num: address.house_num.trim(),
                apartament: address.apartament.trim(),
            });

            await Promise.allSettled(cartItems.map((item) => deleteCartProduct(authorizedRequest, item.id)));
            setCartItems([]);
            setMessage(`Заказ №${result.id} создан${result.price != null ? ` на ${result.price} ₽` : ""}`);
            setIsCheckoutVisible(false);
            setAddress(emptyAddress);
        } catch (error) {
            setMessage(
                error instanceof Error
                    ? error.message
                    : "Не удалось оформить заказ"
            );
        } finally {
            setIsLoading(false);
        }
    }

    if (!authState.isAuthenticated) {
        return (
            <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
                <View style={styles.centerContent}>
                    <View style={styles.centerIcon}>
                        <MaterialCommunityIcons
                            name="cart-outline"
                            size={54}
                            color={theme.colors.primary}
                        />
                    </View>
                    <Text style={styles.title}>Корзина</Text>
                    <Text style={styles.centerText}>Войдите, чтобы использовать корзину.</Text>
                    <Pressable
                        accessibilityRole="button"
                        style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
                        onPress={() => router.push("/login" as never)}
                    >
                        <Text style={styles.primaryButtonText}>Войти</Text>
                    </Pressable>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={() => void loadCart(true)}
                    />
                }
            >
                <View style={styles.header}>
                    <View>
                        <Text style={styles.title}>Корзина</Text>
                        <Text style={styles.subtitle}>Ваши товары</Text>
                    </View>

                    <Pressable
                        accessibilityRole="button"
                        style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
                        onPress={() => void loadCart(true)}
                    >
                        <MaterialCommunityIcons
                            name="reload"
                            size={24}
                            color={theme.colors.primary}
                        />
                    </Pressable>
                </View>

                {message && (
                    <View style={styles.messageBox}>
                        <MaterialCommunityIcons
                            name="information-outline"
                            size={20}
                            color={theme.colors.primary}
                        />
                        <Text style={styles.messageText}>{message}</Text>
                    </View>
                )}

                {isLoading && cartItems.length === 0 ? (
                    <View style={styles.loadingBox}>
                        <ActivityIndicator color={theme.colors.primary} />
                        <Text style={styles.loadingText}>Загрузка корзины...</Text>
                    </View>
                ) : (
                    <View style={styles.itemsList}>
                        {cartItems.map((item) => (
                            <View style={styles.cartItem} key={item.id}>
                                <View style={styles.itemIcon}>
                                    <MaterialCommunityIcons
                                        name="package-variant-closed"
                                        size={28}
                                        color={theme.colors.primary}
                                    />
                                </View>

                                <View style={styles.itemInfo}>
                                    <Text style={styles.itemTitle}>{item.title}</Text>
                                    <Text style={styles.itemMeta}>
                                        {item.price} ₽ × {item.countInCart}
                                    </Text>
                                </View>

                                <Pressable
                                    accessibilityRole="button"
                                    disabled={updatingProductId === item.id}
                                    style={({ pressed }) => [styles.removeButton, pressed && styles.pressed]}
                                    onPress={() => void handleRemove(item)}
                                >
                                    {updatingProductId === item.id ? (
                                        <ActivityIndicator color={theme.colors.error} />
                                    ) : (
                                        <MaterialCommunityIcons
                                            name="minus-circle-outline"
                                            size={26}
                                            color={theme.colors.error}
                                        />
                                    )}
                                </Pressable>
                            </View>
                        ))}
                    </View>
                )}

                <View style={styles.summaryCard}>
                    <Text style={styles.summaryTitle}>Итого</Text>

                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Позиции</Text>
                        <Text style={styles.summaryValue}>{cartItems.length}</Text>
                    </View>

                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Сумма</Text>
                        <Text style={styles.summaryValue}>{totalPrice} ₽</Text>
                    </View>

                    <Pressable
                        accessibilityRole="button"
                        disabled={cartItems.length === 0}
                        style={({ pressed }) => [
                            styles.primaryButton,
                            cartItems.length === 0 && styles.disabledButton,
                            pressed && styles.pressed,
                        ]}
                        onPress={() => setIsCheckoutVisible((value) => !value)}
                    >
                        <Text style={styles.primaryButtonText}>Оформить заказ</Text>
                    </Pressable>
                </View>

                {isCheckoutVisible && (
                    <View style={styles.checkoutCard}>
                        <Text style={styles.summaryTitle}>Адрес доставки</Text>

                        <AddressInput
                            theme={theme}
                            label="Улица"
                            value={address.street}
                            onChangeText={(value) => setAddress((prev) => ({ ...prev, street: value }))}
                        />
                        <AddressInput
                            theme={theme}
                            label="Дом"
                            value={address.house_num}
                            onChangeText={(value) => setAddress((prev) => ({ ...prev, house_num: value }))}
                        />
                        <AddressInput
                            theme={theme}
                            label="Квартира"
                            value={address.apartament}
                            onChangeText={(value) => setAddress((prev) => ({ ...prev, apartament: value }))}
                        />

                        <Pressable
                            accessibilityRole="button"
                            disabled={isLoading}
                            style={({ pressed }) => [styles.primaryButton, isLoading && styles.disabledButton, pressed && styles.pressed]}
                            onPress={() => void handleCheckout()}
                        >
                            {isLoading ? (
                                <ActivityIndicator color={theme.colors.onPrimary} />
                            ) : (
                                <Text style={styles.primaryButtonText}>Создать заказ</Text>
                            )}
                        </Pressable>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

type AddressInputProps = {
    theme: AppTheme;
    label: string;
    value: string;
    onChangeText: (value: string) => void;
};

function AddressInput({ theme, label, value, onChangeText }: AddressInputProps) {
    const styles = createStyles(theme);

    return (
        <View style={styles.fieldGroup}>
            <Text style={styles.inputLabel}>{label}</Text>
            <TextInput
                value={value}
                onChangeText={onChangeText}
                placeholder={label}
                placeholderTextColor={theme.colors.textSecondary}
                style={styles.input}
            />
        </View>
    );
}

function createStyles(theme: AppTheme) {
    return StyleSheet.create({
        safeArea: {
            flex: 1,
            backgroundColor: theme.colors.background,
        },

        content: {
            paddingHorizontal: theme.spacing.xl,
            paddingTop: 56,
            paddingBottom: theme.sizes.tabBarHeight + theme.spacing.xxl,
        },

        centerContent: {
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            padding: theme.spacing.xl,
        },

        centerIcon: {
            width: 104,
            height: 104,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: theme.radius.round,
            backgroundColor: theme.colors.primaryContainer,
            marginBottom: theme.spacing.lg,
        },

        centerText: {
            ...theme.typography.bodyMedium,
            color: theme.colors.textSecondary,
            textAlign: "center",
            marginTop: theme.spacing.sm,
            marginBottom: theme.spacing.xl,
        },

        header: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: theme.spacing.lg,
        },

        title: {
            ...theme.typography.titleLarge,
            color: theme.colors.text,
        },

        subtitle: {
            ...theme.typography.bodyMedium,
            color: theme.colors.textSecondary,
            marginTop: 2,
        },

        iconButton: {
            width: 48,
            height: 48,
            borderRadius: theme.radius.round,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: theme.colors.primaryContainer,
        },

        messageBox: {
            flexDirection: "row",
            alignItems: "flex-start",
            gap: theme.spacing.sm,
            padding: theme.spacing.md,
            borderRadius: theme.radius.md,
            backgroundColor: theme.colors.primaryContainer,
            marginBottom: theme.spacing.lg,
        },

        messageText: {
            ...theme.typography.bodyMedium,
            flex: 1,
            color: theme.colors.text,
        },

        loadingBox: {
            alignItems: "center",
            justifyContent: "center",
            paddingVertical: theme.spacing.xxl,
            gap: theme.spacing.md,
        },

        loadingText: {
            ...theme.typography.bodyMedium,
            color: theme.colors.textSecondary,
        },

        itemsList: {
            gap: theme.spacing.md,
        },

        cartItem: {
            flexDirection: "row",
            alignItems: "center",
            gap: theme.spacing.md,
            padding: theme.spacing.md,
            borderRadius: theme.radius.xl,
            backgroundColor: theme.colors.surface,
            borderWidth: 1,
            borderColor: theme.colors.divider,
        },

        itemIcon: {
            width: 58,
            height: 58,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: theme.radius.lg,
            backgroundColor: theme.colors.primaryContainer,
        },

        itemInfo: {
            flex: 1,
        },

        itemTitle: {
            ...theme.typography.labelLarge,
            color: theme.colors.text,
        },

        itemMeta: {
            ...theme.typography.bodyMedium,
            color: theme.colors.textSecondary,
            marginTop: 2,
        },

        removeButton: {
            width: 44,
            height: 44,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: theme.radius.round,
            backgroundColor: theme.colors.surfaceContainer,
        },

        summaryCard: {
            gap: theme.spacing.md,
            marginTop: theme.spacing.xl,
            padding: theme.spacing.xl,
            borderRadius: theme.radius.xl,
            backgroundColor: theme.colors.surface,
            borderWidth: 1,
            borderColor: theme.colors.divider,
        },

        checkoutCard: {
            gap: theme.spacing.md,
            marginTop: theme.spacing.lg,
            padding: theme.spacing.xl,
            borderRadius: theme.radius.xl,
            backgroundColor: theme.colors.surface,
            borderWidth: 1,
            borderColor: theme.colors.divider,
        },

        summaryTitle: {
            ...theme.typography.titleMedium,
            color: theme.colors.text,
        },

        summaryRow: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
        },

        summaryLabel: {
            ...theme.typography.bodyMedium,
            color: theme.colors.textSecondary,
        },

        summaryValue: {
            ...theme.typography.labelLarge,
            color: theme.colors.text,
        },

        primaryButton: {
            minHeight: 52,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: theme.radius.lg,
            backgroundColor: theme.colors.primary,
            paddingHorizontal: theme.spacing.lg,
        },

        primaryButtonText: {
            ...theme.typography.labelLarge,
            color: theme.colors.onPrimary,
        },

        disabledButton: {
            opacity: 0.62,
        },

        fieldGroup: {
            gap: theme.spacing.xs,
        },

        inputLabel: {
            ...theme.typography.labelLarge,
            color: theme.colors.text,
        },

        input: {
            minHeight: 50,
            borderRadius: theme.radius.lg,
            borderWidth: 1,
            borderColor: theme.colors.divider,
            backgroundColor: theme.colors.surfaceContainer,
            color: theme.colors.text,
            paddingHorizontal: theme.spacing.md,
            ...theme.typography.bodyLarge,
        },

        pressed: {
            opacity: 0.72,
        },
    });
}
