import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PrayerCard } from "@/components/PrayerCard";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { PRAYERS, PrayerCounts, getTotalRemaining } from "@/utils/calculations";
import { getDailyHadith } from "@/utils/hadiths";

const hadith = getDailyHadith();

export default function DashboardScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { currentCounts, initialCounts, decrementPrayer, incrementPrayer, logFullDay } = useApp();
  const quickLogScale = useRef(new Animated.Value(1)).current;
  const [quickLogFlash, setQuickLogFlash] = useState(false);

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);
  const bottomPad = insets.bottom + (Platform.OS === "web" ? 34 : 0);

  const totalRemaining = currentCounts ? getTotalRemaining(currentCounts) : 0;
  const allDone = totalRemaining === 0;

  function handleQuickLog() {
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Animated.sequence([
      Animated.timing(quickLogScale, { toValue: 0.94, duration: 80, useNativeDriver: true }),
      Animated.timing(quickLogScale, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start();
    setQuickLogFlash(true);
    setTimeout(() => setQuickLogFlash(false), 600);
    logFullDay();
  }

  if (!currentCounts || !initialCounts) {
    return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: topPad + 16, paddingBottom: bottomPad + 120 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.greeting, { color: colors.mutedForeground }]}>
              السلام علیکم
            </Text>
            <Text style={[styles.title, { color: colors.foreground }]}>
              Daily Tracker
            </Text>
          </View>
          <View style={[styles.totalBadge, { backgroundColor: colors.emeraldLight }]}>
            <Text style={[styles.totalCount, { color: colors.emerald }]}>
              {totalRemaining.toLocaleString()}
            </Text>
            <Text style={[styles.totalLabel, { color: colors.emerald }]}>remaining</Text>
          </View>
        </View>

        <View style={[styles.hadithCard, { backgroundColor: colors.card, borderColor: colors.goldLight }]}>
          <View style={styles.hadithHeader}>
            <View style={[styles.hadithDot, { backgroundColor: colors.gold }]} />
            <Text style={[styles.hadithSource, { color: colors.gold }]}>{hadith.source}</Text>
          </View>
          <Text style={[styles.hadithText, { color: colors.foreground }]}>"{hadith.text}"</Text>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Prayers</Text>
          <Text style={[styles.sectionSub, { color: colors.mutedForeground }]}>
            Tap + to log a completed Qaza
          </Text>
        </View>

        {PRAYERS.map((prayer) => (
          <PrayerCard
            key={prayer.key}
            prayer={prayer}
            remaining={currentCounts[prayer.key]}
            initialCount={initialCounts[prayer.key]}
            onDecrement={() => decrementPrayer(prayer.key)}
            onIncrement={() => incrementPrayer(prayer.key)}
          />
        ))}

        {allDone && (
          <View style={[styles.completionBanner, { backgroundColor: colors.goldLight, borderColor: colors.gold }]}>
            <Text style={[styles.completionTitle, { color: colors.gold }]}>
              Masha'Allah! 🌙
            </Text>
            <Text style={[styles.completionText, { color: colors.gold }]}>
              You have completed all your Qaza prayers. May Allah accept your efforts.
            </Text>
          </View>
        )}
      </ScrollView>

      {!allDone && (
        <View
          style={[
            styles.quickLogWrapper,
            {
              paddingBottom: bottomPad + 16,
              backgroundColor: colors.background,
            },
          ]}
        >
          <Animated.View style={{ transform: [{ scale: quickLogScale }] }}>
            <Pressable
              onPress={handleQuickLog}
              style={[
                styles.quickLogBtn,
                {
                  backgroundColor: quickLogFlash ? colors.gold : colors.emerald,
                },
              ]}
            >
              <Feather name="check-square" size={20} color="#FFFFFF" />
              <Text style={styles.quickLogText}>Quick Log Full Day</Text>
            </Pressable>
          </Animated.View>
          <Text style={[styles.quickLogHint, { color: colors.mutedForeground }]}>
            Logs one day's Qaza for all 6 prayers
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: 18,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  greeting: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginBottom: 2,
  },
  title: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
  },
  totalBadge: {
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
  },
  totalCount: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    lineHeight: 26,
  },
  totalLabel: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  hadithCard: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
  },
  hadithHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  hadithDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  hadithSource: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  hadithText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
    fontStyle: "italic",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },
  sectionSub: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  completionBanner: {
    borderRadius: 14,
    padding: 20,
    borderWidth: 1.5,
    marginTop: 8,
    alignItems: "center",
  },
  completionTitle: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    marginBottom: 6,
  },
  completionText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 20,
  },
  quickLogWrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 18,
    paddingTop: 12,
    alignItems: "center",
  },
  quickLogBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  quickLogText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: "#FFFFFF",
  },
  quickLogHint: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    marginTop: 6,
  },
});
