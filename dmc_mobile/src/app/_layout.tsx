import React from "react";
import { View, StyleSheet } from "react-native";
import { Tabs } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { theme } from "../../styles/themes";
import type { ColorValue } from "react-native";

type TabIconProps = {
    focused: boolean;
    color: ColorValue;
    size: number;
};

function TabIcon({ focused, color, size, name,}: TabIconProps & {
    name: keyof typeof MaterialCommunityIcons.glyphMap;
}) {
    return (
        <View style={[styles.iconWrapper, focused && styles.iconWrapperActive]}>
            <MaterialCommunityIcons
                name={name}
                size={focused ? theme.sizes.tabBarActiveIcon : size}
                color={color}
            />
        </View>
    );
}

export default function Layout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarShowLabel: true,
                tabBarActiveTintColor: theme.colors.tabIconActive,
                tabBarInactiveTintColor: theme.colors.tabIconInactive,
                tabBarLabelStyle: styles.tabBarLabel,
                tabBarStyle: styles.tabBar,
                tabBarItemStyle: styles.tabBarItem,
                sceneStyle: {
                    backgroundColor: theme.colors.background,
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: "Главная",
                    tabBarIcon: ({ focused, color, size }) => (
                        <TabIcon
                            focused={focused}
                            color={color}
                            size={size}
                            name={focused ? "home-variant" : "home-variant-outline"}
                        />
                    ),
                }}
            />

            <Tabs.Screen
                name="cart"
                options={{
                    title: "Корзина",
                    tabBarIcon: ({ focused, color, size }) => (
                        <TabIcon
                            focused={focused}
                            color={color}
                            size={size}
                            name={focused ? "cart" : "cart-outline"}
                        />
                    ),
                }}
            />

            <Tabs.Screen
                name="profile"
                options={{
                    title: "Профиль",
                    tabBarIcon: ({ focused, color, size }) => (
                        <TabIcon
                            focused={focused}
                            color={color}
                            size={size}
                            name={focused ? "account" : "account-outline"}
                        />
                    ),
                }}
            />
        </Tabs>
    );
}

const styles = StyleSheet.create({
    tabBar: {
        position: "absolute",
        left: theme.spacing.lg,
        right: theme.spacing.lg,
        bottom: theme.spacing.lg,
        height: theme.sizes.tabBarHeight,
        backgroundColor: theme.colors.tabBarBackground,
        borderTopWidth: 0,
        borderWidth: 1,
        borderColor: theme.colors.tabBarBorder,
        borderRadius: theme.radius.xl,
        paddingTop: theme.spacing.sm,
        paddingBottom: theme.spacing.sm,
        shadowColor: theme.colors.shadow,
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.35,
        shadowRadius: 18,

        elevation: 16,
    },

    tabBarItem: {
        borderRadius: theme.radius.lg,
    },

    tabBarLabel: {
        ...theme.typography.tabLabel,
        marginTop: theme.spacing.xs,
    },

    iconWrapper: {
        width: 48,
        height: 34,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: theme.radius.lg,
    },

    iconWrapperActive: {
        backgroundColor: theme.colors.primaryContainer,
    },
});