import { Feather } from "@expo/vector-icons";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { ProgressRing } from "@/components/ProgressRing";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { useLayout } from "@/hooks/useLayout";
import { useTranslation } from "@/hooks/useTranslation";
import {
  PRAYERS,
  getCompletionPercent,
  getPrayerCompletionPercent,
  getTotalRemaining,
} from "@/utils/calculations";
import { getNextMilestone, getPreviousMilestone, MILESTONES } from "@/utils/milestones";
import { isStreakActive } from "@/utils/streak";
import type { TranslationKey } from "@/utils/translations";

function estimateCompletionDays(
  totalRemaining: number,
  setupDate: string | null,
  totalCompleted: number
): string {
  if (totalRemaining === 0) return "";
  if (!setupDate || totalCompleted === 0) return "";
  const daysSinceSetup = Math.max(
    1,
    Math.round((Date.now() - new Date(setupDate).getTime()) / 86400000)
  );
  const dailyRate = totalCompleted / daysSinceSetup;
  if (dailyRate < 0.1) return "";
  const daysLeft = Math.ceil(totalRemaining / dailyRate);
  if (daysLeft > 365 * 30) return "";
  if (daysLeft > 365) {
    const years = Math.round(daysLeft / 365);
    return `~${years}y at current pace`;
  }
  if (daysLeft > 30) {
    const months = Math.round(daysLeft / 30);
    return `~${months}mo at current pace`;
  }
  return `~${daysLeft} day${daysLeft !== 1 ? "s" : ""} at current pace`;
}

export default function ProgressScreen() {
  const colors = useColors();
  const { topPad, scrollBottom, isSmall } = useLayout();
  const { t, isRTL } = useTranslation();
  const { currentCounts, initialCounts, totalCompleted, streak, setupDate } = useApp();

  if (!currentCounts || !initialCounts) {
    return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  }

  const overallPercent = getCompletionPercent(initialCounts, currentCounts);
  const totalInitial = getTotalRemaining(initialCounts);
  const totalRemaining = getTotalRemaining(currentCounts);
  const totalCompletedCalc = totalInitial - totalRemaining;

  const estimateLabel = totalRemaining === 0
    ? t("allDoneEst")
    : !setupDate || totalCompleted === 0
    ? t("keepLogging")
    : estimateCompletionDays(totalRemaining, setupDate, totalCompleted) || t("keepLogging");

  const nextMilestone = getNextMilestone(totalCompleted);
  const prevMilestone = getPreviousMilestone(totalCompleted);
  const milestoneProgress = nextMilestone && prevMilestone
    ? ((totalCompleted - prevMilestone.value) / (nextMilestone.value - prevMilestone.value)) * 100
    : nextMilestone
    ? (totalCompleted / nextMilestone.value) * 100
    : 100;

  const streakActive = isStreakActive(streak);

  const daysSinceSetup = setupDate
    ? Math.max(1, Math.round((Date.now() - new Date(setupDate).getTime()) / 86400000))
    : 1;
  const dailyAvg = totalCompleted > 0 ? (totalCompleted / daysSinceSetup).toFixed(1) : "0";

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: topPad + 16, paddingBottom: scrollBottom }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.pageTitle, { color: colors.foreground, textAlign: isRTL ? "right" : "left" }]}>
          {t("progress")}
        </Text>

        <View style={[styles.overallCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ProgressRing
            percent={overallPercent}
            size={isSmall ? 110 : 130}
            strokeWidth={isSmall ? 9 : 11}
            label={`${Math.round(overallPercent)}%`}
            sublabel={t("complete")}
          />
          <View style={styles.overallStats}>
            <StatPill label={t("total")} value={totalInitial.toLocaleString()} color={colors.foreground} bg={colors.muted} />
            <StatPill label={t("done")} value={totalCompletedCalc.toLocaleString()} color={colors.emerald} bg={colors.emeraldLight} />
            <StatPill label={t("left")} value={totalRemaining.toLocaleString()} color={colors.mutedForeground} bg={colors.muted} />
          </View>
        </View>

        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border, flex: 1 }]}>
            <Text style={styles.statIcon}>📅</Text>
            <Text style={[styles.statBigVal, { color: colors.foreground }]}>{dailyAvg}</Text>
            <Text style={[styles.statCardLabel, { color: colors.mutedForeground }]}>{t("avgPerDay")}</Text>
          </View>
          <View style={[styles.statCard, {
            backgroundColor: streakActive ? colors.goldLight : colors.card,
            borderColor: streakActive ? colors.gold : colors.border, flex: 1,
          }]}>
            <Text style={styles.statIcon}>🔥</Text>
            <Text style={[styles.statBigVal, { color: streakActive ? colors.gold : colors.foreground }]}>
              {streak.currentStreak}
            </Text>
            <Text style={[styles.statCardLabel, { color: streakActive ? colors.gold : colors.mutedForeground }]}>
              {t("dayStreak")}
            </Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border, flex: 1 }]}>
            <Text style={styles.statIcon}>🏆</Text>
            <Text style={[styles.statBigVal, { color: colors.foreground }]}>{streak.longestStreak}</Text>
            <Text style={[styles.statCardLabel, { color: colors.mutedForeground }]}>{t("bestStreak")}</Text>
          </View>
        </View>

        <View style={[styles.estimateCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.estimateLeft, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
            <Feather name="clock" size={18} color={colors.emerald} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.estimateTitle, { color: colors.foreground, textAlign: isRTL ? "right" : "left" }]}>
                {t("completionEstimate")}
              </Text>
              <Text style={[styles.estimateLabel, { color: colors.mutedForeground, textAlign: isRTL ? "right" : "left" }]}>
                {estimateLabel}
              </Text>
            </View>
          </View>
        </View>

        {nextMilestone && (
          <View style={[styles.milestoneCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.milestoneHeader, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
              <Text style={styles.milestoneEmoji}>{nextMilestone.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.milestoneTitle, { color: colors.foreground, textAlign: isRTL ? "right" : "left" }]}>
                  {nextMilestone.title}
                </Text>
                <Text style={[styles.milestoneSub, { color: colors.mutedForeground, textAlign: isRTL ? "right" : "left" }]}>
                  {(nextMilestone.value - totalCompleted).toLocaleString()} {t("prayersAway")} · {nextMilestone.value.toLocaleString()} {t("total")}
                </Text>
              </View>
            </View>
            <View style={[styles.milestoneTrack, { backgroundColor: colors.muted }]}>
              <View
                style={[
                  styles.milestoneFill,
                  { width: `${Math.min(100, milestoneProgress)}%` as any, backgroundColor: colors.gold },
                ]}
              />
            </View>
          </View>
        )}

        <Text style={[styles.sectionTitle, { color: colors.foreground, textAlign: isRTL ? "right" : "left" }]}>
          {t("perPrayer")}
        </Text>

        {PRAYERS.map((prayer) => {
          const initial = initialCounts[prayer.key];
          const current = currentCounts[prayer.key];
          const completed = initial - current;
          const pct = getPrayerCompletionPercent(initial, current);
          const isComplete = current === 0;
          const prayerNameKey = prayer.key as TranslationKey;

          return (
            <View
              key={prayer.key}
              style={[
                styles.prayerRow,
                {
                  backgroundColor: colors.card,
                  borderColor: isComplete ? colors.gold : colors.border,
                  borderWidth: isComplete ? 1.5 : 1,
                },
              ]}
            >
              <View style={[styles.prayerTop, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
                <View style={[styles.prayerIconBg, { backgroundColor: prayer.color + "22" }]}>
                  <View style={[styles.prayerDot, { backgroundColor: prayer.color }]} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.prayerName, { color: colors.foreground, textAlign: isRTL ? "right" : "left" }]}>
                    {t(prayerNameKey)}
                    <Text style={[styles.prayerArabic, { color: colors.mutedForeground }]}>
                      {"  "}{prayer.arabicName}
                    </Text>
                  </Text>
                  <Text style={[styles.prayerMeta, { color: colors.mutedForeground, textAlign: isRTL ? "right" : "left" }]}>
                    {completed.toLocaleString()} {t("done")} · {current.toLocaleString()} {t("left_label")}
                  </Text>
                </View>
                {isComplete ? (
                  <View style={[styles.doneBadge, { backgroundColor: colors.goldLight }]}>
                    <Text style={[styles.doneBadgeText, { color: colors.gold }]}>✓ {t("done")}</Text>
                  </View>
                ) : (
                  <Text style={[styles.prayerPct, { color: prayer.color }]}>{Math.round(pct)}%</Text>
                )}
              </View>
              <View style={[styles.barTrack, { backgroundColor: colors.muted }]}>
                <View style={[styles.barFill, { width: `${pct}%` as any, backgroundColor: isComplete ? colors.gold : prayer.color }]} />
              </View>
            </View>
          );
        })}

        <Text style={[styles.sectionTitle, { color: colors.foreground, textAlign: isRTL ? "right" : "left" }]}>
          {t("milestones")}
        </Text>
        <View style={[styles.milestonesGrid, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {MILESTONES.map((m, i) => {
            const achieved = totalCompleted >= m.value;
            return (
              <React.Fragment key={m.value}>
                {i > 0 && <View style={[styles.mDivider, { backgroundColor: colors.border }]} />}
                <View style={[styles.mRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
                  <Text style={[styles.mEmoji, { opacity: achieved ? 1 : 0.3 }]}>{m.emoji}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.mTitle, { color: achieved ? colors.foreground : colors.mutedForeground, textAlign: isRTL ? "right" : "left" }]}>
                      {m.title}
                    </Text>
                    <Text style={[styles.mSub, { color: colors.mutedForeground, textAlign: isRTL ? "right" : "left" }]}>
                      {m.value.toLocaleString()} {t("prayers")}
                    </Text>
                  </View>
                  {achieved && (
                    <View style={[styles.mBadge, { backgroundColor: colors.goldLight }]}>
                      <Feather name="check" size={12} color={colors.gold} />
                    </View>
                  )}
                </View>
              </React.Fragment>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

function StatPill({ label, value, color, bg }: { label: string; value: string; color: string; bg: string }) {
  return (
    <View style={[pillStyles.pill, { backgroundColor: bg }]}>
      <Text style={[pillStyles.val, { color }]}>{value}</Text>
      <Text style={pillStyles.label}>{label}</Text>
    </View>
  );
}

const pillStyles = StyleSheet.create({
  pill: { flex: 1, alignItems: "center", paddingVertical: 10, borderRadius: 12 },
  val: { fontSize: 17, fontFamily: "Inter_700Bold" },
  label: { fontSize: 10, fontFamily: "Inter_400Regular", color: "#737373", marginTop: 1 },
});

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingHorizontal: 16 },
  pageTitle: { fontSize: 24, fontFamily: "Inter_700Bold", marginBottom: 16 },
  overallCard: {
    borderRadius: 18, borderWidth: 1, padding: 20,
    alignItems: "center", gap: 16, marginBottom: 12,
  },
  overallStats: { flexDirection: "row", width: "100%", gap: 8 },
  statsGrid: { flexDirection: "row", gap: 8, marginBottom: 12 },
  statCard: { borderRadius: 14, borderWidth: 1, padding: 14, alignItems: "center", gap: 4 },
  statIcon: { fontSize: 20 },
  statBigVal: { fontSize: 20, fontFamily: "Inter_700Bold" },
  statCardLabel: { fontSize: 10, fontFamily: "Inter_400Regular", textAlign: "center" },
  estimateCard: { borderRadius: 14, borderWidth: 1, padding: 16, marginBottom: 12 },
  estimateLeft: { alignItems: "center", gap: 12 },
  estimateTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  estimateLabel: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 2 },
  milestoneCard: { borderRadius: 14, borderWidth: 1, padding: 16, marginBottom: 20, gap: 10 },
  milestoneHeader: { alignItems: "center", gap: 10 },
  milestoneEmoji: { fontSize: 28 },
  milestoneTitle: { fontSize: 14, fontFamily: "Inter_700Bold" },
  milestoneSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  milestoneTrack: { height: 6, borderRadius: 3, overflow: "hidden" },
  milestoneFill: { height: 6, borderRadius: 3 },
  sectionTitle: { fontSize: 17, fontFamily: "Inter_700Bold", marginBottom: 10 },
  prayerRow: {
    borderRadius: 14, paddingHorizontal: 14, paddingTop: 12,
    paddingBottom: 14, marginBottom: 8, gap: 10, overflow: "hidden",
  },
  prayerTop: { alignItems: "center", gap: 10 },
  prayerIconBg: { width: 32, height: 32, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  prayerDot: { width: 9, height: 9, borderRadius: 5 },
  prayerName: { fontSize: 14, fontFamily: "Inter_700Bold" },
  prayerArabic: { fontSize: 12, fontFamily: "Inter_400Regular" },
  prayerMeta: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 1 },
  prayerPct: { fontSize: 17, fontFamily: "Inter_700Bold" },
  doneBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  doneBadgeText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  barTrack: { height: 4, borderRadius: 2, overflow: "hidden" },
  barFill: { height: 4, borderRadius: 2 },
  milestonesGrid: { borderRadius: 16, borderWidth: 1, overflow: "hidden", marginBottom: 16 },
  mRow: { alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, gap: 12 },
  mDivider: { height: 1, marginHorizontal: 16 },
  mEmoji: { fontSize: 22, width: 32, textAlign: "center" },
  mTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  mSub: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 1 },
  mBadge: { width: 24, height: 24, borderRadius: 12, alignItems: "center", justifyContent: "center" },
});
