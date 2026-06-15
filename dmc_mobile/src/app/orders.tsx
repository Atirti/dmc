import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useAppTheme } from "../controllers/themecontroller";
import { useAuth } from "../controllers/authcontroller";
import { Order } from "../models/productmodel";
import { getOrders } from "../services/shopapi";
import { AppTheme } from "../../styles/themes";

export default function Orders() {
    const { theme } = useAppTheme();
    const styles = createStyles(theme);
    const { authState, authorizedRequest } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    const loadOrders = useCallback(async (refresh = false) => {
        if (!authState.isAuthenticated) {
            setOrders([]);
            return;
        }

        refresh ? setIsRefreshing(true) : setIsLoading(true);
        setMessage(null);

        try {
            const loadedOrders = await getOrders(authorizedRequest);
            setOrders(loadedOrders);

            if (loadedOrders.length === 0) {
                setMessage("Заказов пока нет. Создайт заказ из корзины.");
            }
        } catch (error) {
            setOrders([]);
            setMessage(
                error instanceof Error
                    ? error.message
                    : "Не удалось загрузить заказы"
            );
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, [authState.isAuthenticated, authorizedRequest]);

    useEffect(() => {
        void loadOrders();
    }, [loadOrders]);

    if (!authState.isAuthenticated) {
        return (
            <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
                <View style={styles.centerContent}>
                    <View style={styles.centerIcon}>
                        <MaterialCommunityIcons
                            name="clipboard-list-outline"
                            size={54}
                            color={theme.colors.primary}
                        />
                    </View>
                    <Text style={styles.title}>Заказы</Text>
                    <Text style={styles.centerText}>Войдите, чтобы увидеть заказы.</Text>
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
                        onRefresh={() => void loadOrders(true)}
                    />
                }
            >
                <View style={styles.header}>
                    <View>
                        <Text style={styles.title}>Заказы</Text>
                        <Text style={styles.subtitle}>История покупок</Text>
                    </View>

                    <Pressable
                        accessibilityRole="button"
                        style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
                        onPress={() => void loadOrders(true)}
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

                {isLoading ? (
                    <View style={styles.loadingBox}>
                        <ActivityIndicator color={theme.colors.primary} />
                        <Text style={styles.loadingText}>Загрузка заказов...</Text>
                    </View>
                ) : (
                    <View style={styles.ordersList}>
                        {orders.map((order) => (
                            <OrderCard
                                key={order.id}
                                theme={theme}
                                order={order}
                            />
                        ))}
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

type OrderCardProps = { theme: AppTheme; order: Order; };

function OrderCard({ theme, order }: OrderCardProps) {
    const styles = createStyles(theme);
    const calculatedTotal = useMemo(
        () => order.products.reduce((sum, product) => sum + product.price * product.count, 0),
        [order.products]
    );
    const displayTotal = order.price ?? calculatedTotal;

    return (
        <View style={styles.orderCard}>
            <View style={styles.orderHeader}>
                <View>
                    <Text style={styles.orderTitle}>Заказ №{order.id}</Text>
                    <Text style={styles.orderStatus}>{order.status ?? "status не указан"}</Text>
                </View>

                <Text style={styles.orderTotal}>{displayTotal} ₽</Text>
            </View>

            <View style={styles.productsBlock}>
                {order.products.length === 0 ? (
                    <Text style={styles.emptyText}>В заказе нет товаров</Text>
                ) : (
                    order.products.map((product) => (
                        <View style={styles.productRow} key={`${order.id}-${product.id}`}>
                            <Text style={styles.productTitle}>{product.title}</Text>
                            <Text style={styles.productCount}>×{product.count}</Text>
                        </View>
                    ))
                )}
            </View>

            {order.address && (
                <View style={styles.addressBlock}>
                    <MaterialCommunityIcons
                        name="map-marker-outline"
                        size={18}
                        color={theme.colors.primary}
                    />
                    <Text style={styles.addressText}>
                        {[order.address.street, order.address.house_num, order.address.apartament ? `кв. ${order.address.apartament}` : ""]
                            .filter(Boolean)
                            .join(", ")}
                    </Text>
                </View>
            )}
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

        ordersList: {
            gap: theme.spacing.md,
        },

        orderCard: {
            gap: theme.spacing.md,
            padding: theme.spacing.xl,
            borderRadius: theme.radius.xl,
            backgroundColor: theme.colors.surface,
            borderWidth: 1,
            borderColor: theme.colors.divider,
        },

        orderHeader: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: theme.spacing.md,
        },

        orderTitle: {
            ...theme.typography.titleMedium,
            color: theme.colors.text,
        },

        orderStatus: {
            ...theme.typography.bodyMedium,
            color: theme.colors.textSecondary,
            marginTop: 2,
        },

        orderTotal: {
            ...theme.typography.titleMedium,
            color: theme.colors.primary,
        },

        productsBlock: {
            gap: theme.spacing.sm,
        },

        productRow: {
            flexDirection: "row",
            justifyContent: "space-between",
            gap: theme.spacing.md,
            paddingVertical: theme.spacing.xs,
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderBottomColor: theme.colors.divider,
        },

        productTitle: {
            ...theme.typography.bodyMedium,
            flex: 1,
            color: theme.colors.text,
        },

        productCount: {
            ...theme.typography.labelLarge,
            color: theme.colors.text,
        },

        emptyText: {
            ...theme.typography.bodyMedium,
            color: theme.colors.textSecondary,
        },

        addressBlock: {
            flexDirection: "row",
            alignItems: "center",
            gap: theme.spacing.sm,
            padding: theme.spacing.md,
            borderRadius: theme.radius.md,
            backgroundColor: theme.colors.surfaceContainer,
        },

        addressText: {
            ...theme.typography.bodyMedium,
            flex: 1,
            color: theme.colors.text,
        },

        primaryButton: {
            minHeight: 48,
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

        pressed: {
            opacity: 0.72,
        },
    });
}
