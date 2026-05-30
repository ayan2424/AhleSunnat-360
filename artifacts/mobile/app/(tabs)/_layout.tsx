import { BlurView } from "expo-blur";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import { Tabs } from "expo-router";
import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";
import { SymbolView } from "expo-symbols";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { Platform, StyleSheet, View, useColorScheme } from "react-native";
import { useColors } from "@/hooks/useColors";
import { useTranslation } from "@/hooks/useTranslation";

function NativeTabLayout() {
  const { t } = useTranslation();
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="tracker">
        <Icon sf={{ default: "moon.stars", selected: "moon.stars.fill" }} />
        <Label>{t("tabTracker" as any) ?? "Tracker"}</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="tasbih">
        <Icon sf={{ default: "circlebadge.2", selected: "circlebadge.2.fill" }} />
        <Label>{t("tasbih")}</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="duas">
        <Icon sf={{ default: "hands.sparkles", selected: "hands.sparkles.fill" }} />
        <Label>{t("azkar")}</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="calendar">
        <Icon sf={{ default: "star.circle", selected: "star.circle.fill" }} />
        <Label>{t("islamicCalendar" as any) ?? "Calendar"}</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="progress">
        <Icon sf={{ default: "chart.bar", selected: "chart.bar.fill" }} />
        <Label>{t("tabProgress" as any) ?? "Progress"}</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="history">
        <Icon sf={{ default: "calendar", selected: "calendar.badge.checkmark" }} />
        <Label>{t("tabHistory" as any) ?? "History"}</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="settings">
        <Icon sf={{ default: "gearshape", selected: "gearshape.fill" }} />
        <Label>{t("tabSettings" as any) ?? "Settings"}</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

function ClassicTabLayout() {
  const colors = useColors();
  const colorScheme = useColorScheme();
  const { t } = useTranslation();
  const isDark = colorScheme === "dark";
  const isIOS = Platform.OS === "ios";
  const isWeb = Platform.OS === "web";

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        headerShown: false,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: isIOS ? "transparent" : colors.background,
          borderTopWidth: isWeb ? 1 : 0,
          borderTopColor: colors.border,
          elevation: 0,
          ...(isWeb ? { height: 84 } : {}),
        },
        tabBarLabelStyle: {
          fontFamily: "Inter_500Medium",
          fontSize: 11,
        },
        tabBarBackground: () =>
          isIOS ? (
            <BlurView
              intensity={100}
              tint={isDark ? "dark" : "light"}
              style={StyleSheet.absoluteFill}
            />
          ) : isWeb ? (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.background }]} />
          ) : null,
      }}
    >
      <Tabs.Screen
        name="tracker"
        options={{
          title: t("dailyTracker"),
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="moon.stars" tintColor={color} size={24} />
            ) : (
              <Feather name="moon" size={22} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="tasbih"
        options={{
          title: t("tasbih"),
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="circlebadge.2" tintColor={color} size={24} />
            ) : (
              <Feather name="rotate-cw" size={22} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="duas"
        options={{
          title: t("azkar"),
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="hands.sparkles" tintColor={color} size={24} />
            ) : (
              <Feather name="book-open" size={22} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: t("islamicCalendar" as any) ?? "Calendar",
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="star.circle" tintColor={color} size={24} />
            ) : (
              <Feather name="star" size={22} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: t("progress"),
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="chart.bar" tintColor={color} size={24} />
            ) : (
              <Feather name="bar-chart-2" size={22} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: t("history"),
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="calendar" tintColor={color} size={24} />
            ) : (
              <Feather name="calendar" size={22} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t("settings"),
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="gearshape" tintColor={color} size={24} />
            ) : (
              <Feather name="settings" size={22} color={color} />
            ),
        }}
      />
    </Tabs>
  );
}

export default function TabLayout() {
  if (isLiquidGlassAvailable()) {
    return <NativeTabLayout />;
  }
  return <ClassicTabLayout />;
}
