import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
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
  useColorScheme,
} from "react-native";
import { MilestoneModal } from "@/components/MilestoneModal";
import { PrayerCard } from "@/components/PrayerCard";
import { ProgressRing } from "@/components/ProgressRing";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { useLayout } from "@/hooks/useLayout";
import { useTranslation } from "@/hooks/useTranslation";
import { PRAYERS, getCompletionPercent, getTotalRemaining } from "@/utils/calculations";
import { getDailyHadith } from "@/utils/hadiths";
import { formatHijri, getSpecialNights, toHijri } from "@/utils/hijri";
import { getNextMilestone } from "@/utils/milestones";
import { getStreakEmoji, isStreakActive } from "@/utils/streak";

const hadith = getDailyHadith();

export default function TrackerScreen() {
  const colors = useColors();
  const colorScheme = useColorScheme();
  const { topPad, scrollBottomFab, fabBottom, isSmall } = useLayout();
  const { t, isRTL } = useTranslation();
  const {
    currentCounts, initialCounts, totalCompleted,
    streak, pendingMilestone, dismissMilestone,
    decrementPrayer, incrementPrayer, logFullDay,
  } = useApp();

  const quickLogScale = useRef(new Animated.Value(1)).current;
  const [hadithExpanded, setHadithExpanded] = useState(false);

  const hijri = toHijri();
  const hijriLabel = formatHijri(hijri);
  const specialNight = getSpecialNights(hijri);

  const totalRemaining = currentCounts ? getTotalRemaining(currentCounts) : 0;
  const overallPercent = currentCounts && initialCounts
    ? getCompletionPercent(initialCounts, currentCounts) : 0;
  const allDone = totalRemaining === 0;
  const streakActive = isStreakActive(streak);
  const nextMilestone = getNextMilestone(totalCompleted);
  const daysUntilNext = nextMilestone ? nextMilestone.value - totalCompleted : null;

  const isDark = colorScheme === "dark";
  const heroColors: [string, string] = isDark
    ? ["#1A3A24", "#0D1A12"]
    : ["#237A50", "#0D3D26"];

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
        contentContainerStyle={[styles.scroll, { paddingBottom: scrollBottomFab }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Gradient Hero ── */}
        <LinearGradient
          colors={heroColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.hero, { paddingTop: topPad + 22 }]}
        >
          {/* Top row: greeting + streak */}
          <View style={[styles.heroTopRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
            <Text style={[styles.heroGreeting, { textAlign: isRTL ? "right" : "left" }]}>
              السلام علیکم
            </Text>
            {streak.currentStreak > 0 && (
              <View style={[
                styles.heroStreakPill,
                { borderColor: streakActive ? "rgba(255,215,0,0.5)" : "rgba(255,255,255,0.2)" },
              ]}>
                <Text style={[
                  styles.heroStreakText,
                  { color: streakActive ? "#FFD700" : "rgba(255,255,255,0.8)" },
                ]}>
                  {getStreakEmoji(streak.currentStreak)} {streak.currentStreak}
                </Text>
              </View>
            )}
          </View>

          <Text style={[styles.heroTitle, { textAlign: isRTL ? "right" : "left" }]}>
            {t("dailyTracker")}
          </Text>

          {/* Hijri chips */}
          <View style={[styles.heroChipRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
            <View style={styles.heroChip}>
              <Text style={styles.heroChipText}>🌙 {hijriLabel}</Text>
            </View>
            {specialNight && (
              <View style={[styles.heroChip, { backgroundColor: "rgba(255,215,0,0.18)", borderColor: "rgba(255,215,0,0.35)" }]}>
                <Text style={styles.heroChipText}>{specialNight}</Text>
              </View>
            )}
          </View>

          {/* Progress ring + stats */}
          <View style={[styles.heroStatsRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
            <ProgressRing
              percent={overallPercent}
              size={isSmall ? 84 : 98}
              strokeWidth={isSmall ? 8 : 10}
              label={`${Math.round(overallPercent)}%`}
              sublabel={t("done")}
              color="rgba(255,255,255,0.95)"
              trackColor="rgba(255,255,255,0.18)"
              textColor="#FFFFFF"
            />
            <View style={styles.heroRight}>
              <View style={[styles.heroStatRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
                <View style={styles.heroStat}>
                  <Text style={styles.heroStatVal}>{totalCompleted.toLocaleString()}</Text>
                  <Text style={styles.heroStatLabel}>{t("completed")}</Text>
                </View>
                <View style={styles.heroStatSep} />
                <View style={styles.heroStat}>
                  <Text style={styles.heroStatVal}>{totalRemaining.toLocaleString()}</Text>
                  <Text style={styles.heroStatLabel}>{t("remaining")}</Text>
                </View>
                <View style={styles.heroStatSep} />
                <View style={styles.heroStat}>
                  <Text style={styles.heroStatVal}>{streak.longestStreak}</Text>
                  <Text style={styles.heroStatLabel}>{t("bestStreak")}</Text>
                </View>
              </View>

              {!allDone && nextMilestone && daysUntilNext !== null && (
                <View style={[styles.heroMilestone, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
                  <Text style={styles.heroMilestoneText} numberOfLines={2}>
                    🎯 {daysUntilNext.toLocaleString()} {t("nextTo")} {nextMilestone.emoji} {nextMilestone.title}
                  </Text>
                </View>
              )}
              {allDone && (
                <View style={styles.heroMilestone}>
                  <Text style={styles.heroMilestoneText}>🎉 {t("allDoneChip")}</Text>
                </View>
              )}
            </View>
          </View>
        </LinearGradient>

        {/* ── Content below hero ── */}
        <View style={styles.content}>
          {/* Hadith card */}
          <Pressable
            onPress={() => setHadithExpanded(!hadithExpanded)}
            style={[styles.hadithCard, {
              backgroundColor: colors.card,
              borderColor: colors.goldLight,
              shadowColor: colors.gold,
            }]}
          >
            <View style={[styles.hadithHeader, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
              <View style={[styles.hadithDot, { backgroundColor: colors.gold }]} />
              <Text style={[styles.hadithSource, { color: colors.gold }]}>{hadith.source}</Text>
              <Feather
                name={hadithExpanded ? "chevron-up" : "chevron-down"}
                size={13}
                color={colors.gold}
                style={{ marginLeft: isRTL ? 0 : "auto", marginRight: isRTL ? "auto" : 0 }}
              />
            </View>
            <Text
              style={[styles.hadithText, { color: colors.foreground, textAlign: isRTL ? "right" : "left" }]}
              numberOfLines={hadithExpanded ? undefined : 2}
            >
              "{hadith.text}"
            </Text>
          </Pressable>

          {/* Section header */}
          <View style={[styles.sectionHeader, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{t("prayers")}</Text>
            <Text style={[styles.sectionHint, { color: colors.mutedForeground }]}>{t("logAndUndo")}</Text>
          </View>

          {/* Prayer cards */}
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
        </View>
      </ScrollView>

      {/* FAB */}
      {!allDone && (
        <View style={[styles.fab, { bottom: fabBottom, paddingBottom: 12 }]}>
          <Animated.View style={{ transform: [{ scale: quickLogScale }], width: "100%" }}>
            <Pressable
              onPress={handleQuickLog}
              style={[styles.quickLogBtn, { backgroundColor: colors.emerald }]}
              android_ripple={{ color: "rgba(255,255,255,0.2)" }}
            >
              <Feather name="check-square" size={18} color="#FFFFFF" />
              <Text style={styles.quickLogText}>{t("quickLogFullDay")}</Text>
              <View style={styles.quickLogPill}>
                <Text style={styles.quickLogPillText}>{t("sixPrayers")}</Text>
              </View>
            </Pressable>
          </Animated.View>
          <Text style={[styles.fabHint, { color: colors.mutedForeground }]}>
            {t("logsOneQaza")}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: {},

  hero: {
    paddingHorizontal: 20,
    paddingBottom: 28,
    gap: 14,
  },
  heroTopRow: {
    alignItems: "center",
    justifyContent: "space-between",
  },
  heroGreeting: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.7)",
    flex: 1,
  },
  heroStreakPill: {
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  heroStreakText: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
  },
  heroTitle: {
    fontSize: 32,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
    lineHeight: 38,
  },
  heroChipRow: { flexWrap: "wrap", gap: 8 },
  heroChip: {
    backgroundColor: "rgba(255,255,255,0.16)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.28)",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  heroChipText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    color: "#FFFFFF",
  },
  heroStatsRow: {
    gap: 16,
    alignItems: "center",
    marginTop: 4,
  },
  heroRight: { flex: 1, gap: 10 },
  heroStatRow: { alignItems: "center" },
  heroStat: { flex: 1, alignItems: "center" },
  heroStatVal: { fontSize: 18, fontFamily: "Inter_700Bold", color: "#FFFFFF" },
  heroStatLabel: {
    fontSize: 9,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.65)",
    textAlign: "center",
    marginTop: 2,
  },
  heroStatSep: { width: 1, height: 26, backgroundColor: "rgba(255,255,255,0.2)" },
  heroMilestone: {
    backgroundColor: "rgba(255,255,255,0.14)",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
    alignItems: "center",
    gap: 4,
  },
  heroMilestoneText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    color: "rgba(255,255,255,0.92)",
    textAlign: "center",
  },

  content: { paddingHorizontal: 16, paddingTop: 18 },
  hadithCard: {
    borderRadius: 16,
    padding: 14,
    marginBottom: 18,
    borderWidth: 1,
    gap: 6,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
  },
  hadithHeader: { alignItems: "center", gap: 7 },
  hadithDot: { width: 6, height: 6, borderRadius: 3 },
  hadithSource: { fontSize: 10, fontFamily: "Inter_600SemiBold", letterSpacing: 0.6, textTransform: "uppercase" },
  hadithText: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 20, fontStyle: "italic" },

  sectionHeader: { alignItems: "baseline", justifyContent: "space-between", marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },
  sectionHint: { fontSize: 11, fontFamily: "Inter_400Regular" },

  fab: {
    position: "absolute", left: 0, right: 0,
    paddingHorizontal: 16, paddingTop: 10, alignItems: "center",
    backgroundColor: "transparent",
  },
  quickLogBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 10, paddingVertical: 16, borderRadius: 20, width: "100%",
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18, shadowRadius: 14, elevation: 7,
  },
  quickLogText: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#FFFFFF" },
  quickLogPill: {
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.22)",
  },
  quickLogPillText: { fontSize: 11, fontFamily: "Inter_600SemiBold", color: "#FFFFFF" },
  fabHint: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 5 },
});
