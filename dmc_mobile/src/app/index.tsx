import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Image,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useAppTheme } from "../controllers/themecontroller";
import { useAuth } from "../controllers/authcontroller";
import { Category, Product, resolveMediaUrl } from "../models/productmodel";
import { getCart, getCatalog, setCartProductCount } from "../services/shopapi";
import { AppTheme } from "../../styles/themes";

type SortPreset = {
    label: string;
    sort: "date" | "price";
    order: "asc" | "desc";
};

const sortPresets: SortPreset[] = [
    { label: "Новые", sort: "date", order: "desc" },
    { label: "Цена ↑", sort: "price", order: "asc" },
    { label: "Цена ↓", sort: "price", order: "desc" },
];

export default function Index() {
    const { theme } = useAppTheme();
    const styles = createStyles(theme);
    const { apiBaseUrl, authState, authorizedRequest } = useAuth();
    const [categories, setCategories] = useState<Category[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
    const [sortPreset, setSortPreset] = useState(sortPresets[0]);
    const [isLoading, setIsLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [addingProductId, setAddingProductId] = useState<number | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    const loadCatalog = useCallback(async (refresh = false) => {
        refresh ? setIsRefreshing(true) : setIsLoading(true);
        setMessage(null);

        try {
            const catalog = await getCatalog(apiBaseUrl, {
                limit: 20,
                categoryId: selectedCategoryId,
                sort: sortPreset.sort,
                order: sortPreset.order,
            });

            setCategories(catalog.categories);
            setProducts(catalog.products);

            if (catalog.products.length === 0) {
                setMessage("Товаров пока нет.");
            }
        } catch (error) {
            setProducts([]);
            setMessage(
                error instanceof Error
                    ? error.message
                    : "Не удалось загрузить товары"
            );
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, [apiBaseUrl, selectedCategoryId, sortPreset.order, sortPreset.sort]);

    useEffect(() => {
        void loadCatalog();
    }, [loadCatalog]);

    const selectedCategoryTitle = useMemo(() => {
        if (selectedCategoryId === null) {
            return "Все категории";
        }

        return categories.find((category) => category.id === selectedCategoryId)?.title ?? "Категория";
    }, [categories, selectedCategoryId]);

    async function handleAddToCart(product: Product) {
        if (!authState.isAuthenticated) {
            router.push("/login" as never);
            return;
        }

        setAddingProductId(product.id);
        setMessage(null);

        try {
            const cart = await getCart(authorizedRequest);
            const existingCount = cart.find((item) => item.id === product.id)?.countInCart ?? 0;
            await setCartProductCount(authorizedRequest, product.id, existingCount + 1);
            setMessage(`«${product.title}» добавлен в корзину`);
        } catch (error) {
            setMessage(
                error instanceof Error
                    ? error.message
                    : "Не удалось добавить товар в корзину"
            );
        } finally {
            setAddingProductId(null);
        }
    }

    return (
        <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={() => void loadCatalog(true)}
                    />
                }
            >
                <View style={styles.header}>
                    <View>
                        <Text style={styles.title}>DMC Market</Text>
                        <Text style={styles.subtitle}>Каталог товаров</Text>
                    </View>

                    <Pressable
                        accessibilityRole="button"
                        style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
                        onPress={() => void loadCatalog(true)}
                    >
                        <MaterialCommunityIcons
                            name="reload"
                            size={24}
                            color={theme.colors.primary}
                        />
                    </Pressable>
                </View>


                <Text style={styles.sectionTitle}>Категории</Text>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.chipsRow}
                >
                    <Chip
                        theme={theme}
                        label="Все"
                        selected={selectedCategoryId === null}
                        onPress={() => setSelectedCategoryId(null)}
                    />

                    {categories.map((category) => (
                        <Chip
                            key={category.id}
                            theme={theme}
                            label={category.title}
                            selected={selectedCategoryId === category.id}
                            onPress={() => setSelectedCategoryId(category.id)}
                        />
                    ))}
                </ScrollView>

                <View style={styles.filterHeader}>
                    <View>
                        <Text style={styles.sectionTitle}>Товары</Text>
                        <Text style={styles.filterSubtitle}>{selectedCategoryTitle}</Text>
                    </View>

                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View style={styles.sortRow}>
                            {sortPresets.map((preset) => (
                                <Chip
                                    key={`${preset.sort}-${preset.order}`}
                                    theme={theme}
                                    label={preset.label}
                                    selected={preset.label === sortPreset.label}
                                    onPress={() => setSortPreset(preset)}
                                />
                            ))}
                        </View>
                    </ScrollView>
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
                        <Text style={styles.loadingText}>Загрузка товаров...</Text>
                    </View>
                ) : (
                    <View style={styles.productsList}>
                        {products.map((product) => (
                            <ProductCard
                                key={product.id}
                                theme={theme}
                                apiBaseUrl={apiBaseUrl}
                                product={product}
                                isAdding={addingProductId === product.id}
                                onAdd={() => void handleAddToCart(product)}
                            />
                        ))}
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

type ChipProps = {
    theme: AppTheme;
    label: string;
    selected: boolean;
    onPress: () => void;
};

function Chip({ theme, label, selected, onPress }: ChipProps) {
    const styles = createStyles(theme);

    return (
        <Pressable
            accessibilityRole="button"
            style={({ pressed }) => [
                styles.chip,
                selected && styles.chipSelected,
                pressed && styles.pressed,
            ]}
            onPress={onPress}
        >
            <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
        </Pressable>
    );
}

type ProductCardProps = {
    theme: AppTheme;
    apiBaseUrl: string;
    product: Product;
    isAdding: boolean;
    onAdd: () => void;
};

function ProductCard({ theme, apiBaseUrl, product, isAdding, onAdd }: ProductCardProps) {
    const styles = createStyles(theme);
    const imageUrl = resolveMediaUrl(apiBaseUrl, product.pictureUrl);

    return (
        <View style={styles.productCard}>
            {imageUrl ? (
                <Image source={{ uri: imageUrl }} style={styles.productImage} />
            ) : (
                <View style={styles.productImagePlaceholder}>
                    <MaterialCommunityIcons
                        name="image-outline"
                        size={34}
                        color={theme.colors.primary}
                    />
                </View>
            )}

            <View style={styles.productBody}>
                <View style={styles.productTopRow}>
                    <View style={styles.productTitleBlock}>
                        <Text style={styles.productTitle}>{product.title}</Text>
                        {product.category && (
                            <Text style={styles.productCategory}>{product.category.title}</Text>
                        )}
                    </View>

                    <Text style={styles.productPrice}>{product.price} ₽</Text>
                </View>

                {product.description ? (
                    <Text style={styles.productDescription} numberOfLines={3}>
                        {product.description}
                    </Text>
                ) : null}

                <View style={styles.productFooter}>
                    <Text style={styles.stockText}>
                        Остаток: {product.countInStock ?? "—"}
                    </Text>

                    <Pressable
                        accessibilityRole="button"
                        disabled={isAdding}
                        style={({ pressed }) => [
                            styles.addButton,
                            isAdding && styles.addButtonDisabled,
                            pressed && styles.pressed,
                        ]}
                        onPress={onAdd}
                    >
                        {isAdding ? (
                            <ActivityIndicator color={theme.colors.onPrimary} />
                        ) : (
                            <Text style={styles.addButtonText}>В корзину</Text>
                        )}
                    </Pressable>
                </View>
            </View>
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

        sectionTitle: {
            ...theme.typography.titleMedium,
            color: theme.colors.text,
        },

        chipsRow: {
            gap: theme.spacing.sm,
            paddingVertical: theme.spacing.md,
        },

        chip: {
            minHeight: 38,
            justifyContent: "center",
            paddingHorizontal: theme.spacing.md,
            borderRadius: theme.radius.round,
            backgroundColor: theme.colors.surface,
            borderWidth: 1,
            borderColor: theme.colors.divider,
        },

        chipSelected: {
            backgroundColor: theme.colors.primary,
            borderColor: theme.colors.primary,
        },

        chipText: {
            ...theme.typography.labelLarge,
            color: theme.colors.text,
        },

        chipTextSelected: {
            color: theme.colors.onPrimary,
        },

        filterHeader: {
            gap: theme.spacing.sm,
            marginTop: theme.spacing.sm,
            marginBottom: theme.spacing.md,
        },

        filterSubtitle: {
            ...theme.typography.bodyMedium,
            color: theme.colors.textSecondary,
            marginTop: 2,
        },

        sortRow: {
            flexDirection: "row",
            gap: theme.spacing.sm,
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

        productsList: {
            gap: theme.spacing.md,
        },

        productCard: {
            overflow: "hidden",
            borderRadius: theme.radius.xl,
            backgroundColor: theme.colors.surface,
            borderWidth: 1,
            borderColor: theme.colors.divider,
        },

        productImage: {
            width: "100%",
            height: 178,
            backgroundColor: theme.colors.surfaceContainer,
        },

        productImagePlaceholder: {
            width: "100%",
            height: 178,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: theme.colors.primaryContainer,
        },

        productBody: {
            padding: theme.spacing.lg,
            gap: theme.spacing.md,
        },

        productTopRow: {
            flexDirection: "row",
            gap: theme.spacing.md,
            justifyContent: "space-between",
        },

        productTitleBlock: {
            flex: 1,
        },

        productTitle: {
            ...theme.typography.titleMedium,
            color: theme.colors.text,
        },

        productCategory: {
            ...theme.typography.bodyMedium,
            color: theme.colors.textSecondary,
            marginTop: 2,
        },

        productPrice: {
            ...theme.typography.titleMedium,
            color: theme.colors.primary,
        },

        productDescription: {
            ...theme.typography.bodyMedium,
            color: theme.colors.textSecondary,
        },

        productFooter: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: theme.spacing.md,
        },

        stockText: {
            ...theme.typography.bodyMedium,
            color: theme.colors.textSecondary,
        },

        addButton: {
            minHeight: 42,
            minWidth: 112,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: theme.radius.round,
            backgroundColor: theme.colors.primary,
            paddingHorizontal: theme.spacing.md,
        },

        addButtonDisabled: {
            opacity: 0.62,
        },

        addButtonText: {
            ...theme.typography.labelLarge,
            color: theme.colors.onPrimary,
        },

        pressed: {
            opacity: 0.72,
        },
    });
}
