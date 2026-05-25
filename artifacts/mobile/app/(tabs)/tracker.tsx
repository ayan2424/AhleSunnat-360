import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useRef, useState } from "react";
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
import { MilestoneModal } from "@/components/MilestoneModal";
import { PrayerCard } from "@/components/PrayerCard";
import { ProgressRing } from "@/components/ProgressRing";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { PRAYERS, getCompletionPercent, getTotalRemaining } from "@/utils/calculations";
import { getDailyHadith } from "@/utils/hadiths";
import { getNextMilestone } from "@/utils/milestones";
import { getStreakEmoji, isStreakActive } from "@/utils/streak";

const hadith = getDailyHadith();

export default function TrackerScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const {
    currentCounts, initialCounts, totalCompleted,
    streak, pendingMilestone, dismissMilestone,
    decrementPrayer, incrementPrayer, logFullDay,
  } = useApp();

  const quickLogScale = useRef(new Animated.Value(1)).current;
  const [hadithExpanded, setHadithExpanded] = useState(false);

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);
  const bottomPad = insets.bottom + (Platform.OS === "web" ? 34 : 0);

  const totalRemaining = currentCounts ? getTotalRemaining(currentCounts) : 0;
  const overallPercent = currentCounts && initialCounts
    ? getCompletionPercent(initialCounts, currentCounts) : 0;
  const allDone = totalRemaining === 0;
  const streakActive = isStreakActive(streak);
  const nextMilestone = getNextMilestone(totalCompleted);
  const daysUntilNext = nextMilestone ? nextMilestone.value - totalCompleted : null;

  function handleQuickLog() {
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Animated.sequence([
      Animated.timing(quickLogScale, { toValue: 0.93, duration: 80, useNativeDriver: true }),
      Animated.spring(quickLogScale, { toValue: 1, friction: 4, useNativeDriver: true }),
    ]).start();
    logFullDay();
  }

  if (!currentCounts || !initialCounts) {
    return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <MilestoneModal milestone={pendingMilestone} onDismiss={dismissMilestone} />

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: topPad + 12, paddingBottom: bottomPad + 110 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topRow}>
          <View>
            <Text style={[styles.greeting, { color: colors.mutedForeground }]}>السلام علیکم</Text>
            <Text style={[styles.pageTitle, { color: colors.foreground }]}>Daily Tracker</Text>
          </View>
          {streak.currentStreak > 0 && (
            <View style={[styles.streakBadge, {
              backgroundColor: streakActive ? colors.goldLight : colors.muted,
              borderColor: streakActive ? colors.gold : colors.border,
            }]}>
              <Text style={styles.streakEmoji}>{getStreakEmoji(streak.currentStreak)}</Text>
              <Text style={[styles.streakNum, { color: streakActive ? colors.gold : colors.mutedForeground }]}>
                {streak.currentStreak}
              </Text>
              <Text style={[styles.streakLabel, { color: streakActive ? colors.gold : colors.mutedForeground }]}>
                day{streak.currentStreak !== 1 ? "s" : ""}
              </Text>
            </View>
          )}
        </View>

        <View style={[styles.heroCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ProgressRing
            percent={overallPercent}
            size={96}
            strokeWidth={9}
            label={`${Math.round(overallPercent)}%`}
            sublabel="done"
          />
          <View style={styles.heroRight}>
            <View style={styles.heroStats}>
              <View style={styles.heroStat}>
                <Text style={[styles.heroVal, { color: colors.foreground }]}>
                  {totalCompleted.toLocaleString()}
                </Text>
                <Text style={[styles.heroLabel, { color: colors.mutedForeground }]}>completed</Text>
              </View>
              <View style={[styles.heroDivider, { backgroundColor: colors.border }]} />
              <View style={styles.heroStat}>
                <Text style={[styles.heroVal, { color: colors.foreground }]}>
                  {totalRemaining.toLocaleString()}
                </Text>
                <Text style={[styles.heroLabel, { color: colors.mutedForeground }]}>remaining</Text>
              </View>
              <View style={[styles.heroDivider, { backgroundColor: colors.border }]} />
              <View style={styles.heroStat}>
                <Text style={[styles.heroVal, { color: colors.foreground }]}>
                  {streak.longestStreak}
                </Text>
                <Text style={[styles.heroLabel, { color: colors.mutedForeground }]}>best streak</Text>
              </View>
            </View>
            {!allDone && nextMilestone && daysUntilNext !== null && (
              <View style={[styles.nextTarget, { backgroundColor: colors.emeraldLight }]}>
                <Feather name="target" size={11} color={colors.emerald} />
                <Text style={[styles.nextTargetText, { color: colors.emerald }]}>
                  {daysUntilNext.toLocaleString()} to {nextMilestone.emoji} {nextMilestone.title}
                </Text>
              </View>
            )}
            {allDone && (
              <View style={[styles.nextTarget, { backgroundColor: colors.goldLight }]}>
                <Text style={{ fontSize: 11 }}>🎉</Text>
                <Text style={[styles.nextTargetText, { color: colors.gold }]}>All Qaza completed!</Text>
              </View>
            )}
          </View>
        </View>

        <Pressable
          onPress={() => setHadithExpanded(!hadithExpanded)}
          style={[styles.hadithCard, { backgroundColor: colors.card, borderColor: colors.goldLight }]}
        >
          <View style={styles.hadithHeader}>
            <View style={[styles.hadithDot, { backgroundColor: colors.gold }]} />
            <Text style={[styles.hadithSource, { color: colors.gold }]}>{hadith.source}</Text>
            <Feather
              name={hadithExpanded ? "chevron-up" : "chevron-down"}
              size={13}
              color={colors.gold}
              style={{ marginLeft: "auto" }}
            />
          </View>
          <Text
            style={[styles.hadithText, { color: colors.foreground }]}
            numberOfLines={hadithExpanded ? undefined : 2}
          >
            "{hadith.text}"
          </Text>
        </Pressable>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Prayers</Text>
          <Text style={[styles.sectionHint, { color: colors.mutedForeground }]}>✓ log · − undo</Text>
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
      </ScrollView>

      {!allDone && (
        <View style={[styles.fab, { paddingBottom: bottomPad + 12, backgroundColor: colors.background }]}>
          <Animated.View style={{ transform: [{ scale: quickLogScale }], width: "100%" }}>
            <Pressable
              onPress={handleQuickLog}
              style={[styles.quickLogBtn, { backgroundColor: colors.emerald }]}
            >
              <Feather name="check-square" size={18} color="#FFFFFF" />
              <Text style={styles.quickLogText}>Quick Log Full Day</Text>
              <View style={styles.quickLogPill}>
                <Text style={styles.quickLogPillText}>6 prayers</Text>
              </View>
            </Pressable>
          </Animated.View>
          <Text style={[styles.fabHint, { color: colors.mutedForeground }]}>
            Logs one Qaza for each of the 6 prayers
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingHorizontal: 16 },
  topRow: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 },
  greeting: { fontSize: 12, fontFamily: "Inter_400Regular", marginBottom: 2 },
  pageTitle: { fontSize: 24, fontFamily: "Inter_700Bold" },
  streakBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 11, paddingVertical: 7, borderRadius: 13, borderWidth: 1.5,
  },
  streakEmoji: { fontSize: 15 },
  streakNum: { fontSize: 17, fontFamily: "Inter_700Bold" },
  streakLabel: { fontSize: 10, fontFamily: "Inter_400Regular" },
  heroCard: {
    borderRadius: 18, borderWidth: 1, padding: 16,
    flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 12,
  },
  heroRight: { flex: 1, gap: 10 },
  heroStats: { flexDirection: "row", alignItems: "center" },
  heroStat: { flex: 1, alignItems: "center" },
  heroVal: { fontSize: 18, fontFamily: "Inter_700Bold" },
  heroLabel: { fontSize: 10, fontFamily: "Inter_400Regular", marginTop: 1 },
  heroDivider: { width: 1, height: 26 },
  nextTarget: {
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingHorizontal: 9, paddingVertical: 5, borderRadius: 9,
  },
  nextTargetText: { fontSize: 11, fontFamily: "Inter_600SemiBold", flex: 1 },
  hadithCard: { borderRadius: 14, padding: 13, marginBottom: 16, borderWidth: 1, gap: 5 },
  hadithHeader: { flexDirection: "row", alignItems: "center", gap: 6 },
  hadithDot: { width: 6, height: 6, borderRadius: 3 },
  hadithSource: { fontSize: 10, fontFamily: "Inter_600SemiBold", letterSpacing: 0.5, textTransform: "uppercase" },
  hadithText: { fontSize: 12.5, fontFamily: "Inter_400Regular", lineHeight: 19, fontStyle: "italic" },
  sectionHeader: {
    flexDirection: "row", alignItems: "baseline",
    justifyContent: "space-between", marginBottom: 10,
  },
  sectionTitle: { fontSize: 17, fontFamily: "Inter_700Bold" },
  sectionHint: { fontSize: 11, fontFamily: "Inter_400Regular" },
  fab: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    paddingHorizontal: 16, paddingTop: 10, alignItems: "center",
  },
  quickLogBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 10, paddingVertical: 15, borderRadius: 18, width: "100%",
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15, shadowRadius: 12, elevation: 6,
  },
  quickLogText: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#FFFFFF" },
  quickLogPill: {
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.22)",
  },
  quickLogPillText: { fontSize: 11, fontFamily: "Inter_600SemiBold", color: "#FFFFFF" },
  fabHint: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 5 },
});
