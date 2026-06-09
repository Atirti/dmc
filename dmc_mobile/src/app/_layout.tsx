import React from "react";
import { Tabs } from "expo-router";

export default function Layout() {
  return (
      <Tabs>
        <Tabs.Screen name="index" options={{ title: "Домашний" }} />
        <Tabs.Screen name="cart" options={{ title: "Корзина" }} />
        <Tabs.Screen name="profile" options={{ title: "Профиль" }} />
      </Tabs>
  );
}