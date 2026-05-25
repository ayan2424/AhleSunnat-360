import React, { useMemo } from "react";
import { ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { useLayout } from "@/hooks/useLayout";
import { useTranslation } from "@/hooks/useTranslation";
import { isStreakActive } from "@/utils/streak";

const DAYS = ["S", "M", "T", "W", "T", "F", "S"];
const WEEKS = 14;
const GAP = 4;

function getIntensity(count: number): number {
  if (count === 0) return 0;
  if (count <= 2) return 1;
  if (count <= 4) return 2;
  if (count <= 6) return 3;
  return 4;
}

function buildGrid(history: Record<string, number>) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days: { date: string; count: number; isToday: boolean; isFuture: boolean }[] = [];

  const gridEnd = new Date(today);
  const dayOfWeek = today.getDay();
  gridEnd.setDate(today.getDate() + (6 - dayOfWeek));

  const gridStart = new Date(gridEnd);
  gridStart.setDate(gridEnd.getDate() - WEEKS * 7 + 1);

  const cursor = new Date(gridStart);
  while (cursor <= gridEnd) {
    const dateStr = cursor.toISOString().split("T")[0];
    days.push({
      date: dateStr,
      count: history[dateStr] ?? 0,
      isToday: dateStr === today.toISOString().split("T")[0],
      isFuture: cursor > today,
    });
    cursor.setDate(cursor.getDate() + 1);
  }

  const weeks: typeof days[] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  return { weeks, gridStart };
}

function getMonthLabels(weeks: ReturnType<typeof buildGrid>["weeks"]) {
  const labels: { label: string; colIndex: number }[] = [];
  let lastMonth = -1;
  weeks.forEach((week, i) => {
    const d = new Date(week[0].date);
    if (d.getMonth() !== lastMonth) {
      labels.push({ label: d.toLocaleString("default", { month: "short" }), colIndex: i });
      lastMonth = d.getMonth();
    }
  });
  return labels;
}

export default function HistoryScreen() {
  const colors = useColors();
  const { topPad, scrollBottom } = useLayout();
  const { t, isRTL } = useTranslation();
  const { width: screenWidth } = useWindowDimensions();
  const { history, streak } = useApp();

  // Responsive cell size: fit within available width with some margins
  const calPaddingH = 16 + 24 + 4; // card padding + day labels + gap
  const availableWidth = screenWidth - calPaddingH - 32; // 32 for outer scroll padding
  const CELL = Math.max(16, Math.min(22, Math.floor((availableWidth - (WEEKS - 1) * GAP) / WEEKS)));

  const { weeks } = useMemo(() => buildGrid(history), [history]);
  const monthLabels = useMemo(() => getMonthLabels(weeks), [weeks]);

  const streakActive = isStreakActive(streak);

  const totalDaysLogged = Object.keys(history).filter((k) => history[k] > 0).length;
  const totalPrayersInHistory = Object.values(history).reduce((s, v) => s + v, 0);
  const bestDay = Object.values(history).reduce((m, v) => Math.max(m, v), 0);

  const intensityColors = [
    colors.muted,
    colors.emerald + "44",
    colors.emerald + "77",
    colors.emerald + "BB",
    colors.emerald,
  ];

  const lastWeeksText = t("lastWeeks").replace("{n}", String(WEEKS));

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: topPad + 16, paddingBottom: scrollBottom }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.pageTitle, { color: colors.foreground, textAlign: isRTL ? "right" : "left" }]}>
          {t("history")}
        </Text>

        <View style={styles.streakRow}>
          <View style={[styles.streakCard, {
            backgroundColor: streakActive ? colors.goldLight : colors.card,
            borderColor: streakActive ? colors.gold : colors.border,
          }]}>
            <Text style={styles.streakEmoji}>{streakActive ? "🔥" : "🌙"}</Text>
            <Text style={[styles.streakNum, { color: streakActive ? colors.gold : colors.foreground }]}>
              {streak.currentStreak}
            </Text>
            <Text style={[styles.streakLabel, { color: streakActive ? colors.gold : colors.mutedForeground }]}>
              {t("currentStreak")}
            </Text>
          </View>
          <View style={[styles.streakCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={styles.streakEmoji}>🏆</Text>
            <Text style={[styles.streakNum, { color: colors.foreground }]}>{streak.longestStreak}</Text>
            <Text style={[styles.streakLabel, { color: colors.mutedForeground }]}>{t("bestStreak")}</Text>
          </View>
          <View style={[styles.streakCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={styles.streakEmoji}>📅</Text>
            <Text style={[styles.streakNum, { color: colors.foreground }]}>{totalDaysLogged}</Text>
            <Text style={[styles.streakLabel, { color: colors.mutedForeground }]}>{t("daysLogged")}</Text>
          </View>
        </View>

        <View style={[styles.calCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.calTitle, { color: colors.foreground, textAlign: isRTL ? "right" : "left" }]}>
            {t("prayerActivity")}
          </Text>
          <Text style={[styles.calSub, { color: colors.mutedForeground, textAlign: isRTL ? "right" : "left" }]}>
            {lastWeeksText}
          </Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.calScroll}>
            <View>
              <View style={styles.monthRow}>
                {monthLabels.map(({ label, colIndex }) => (
                  <View key={`${label}-${colIndex}`} style={{ position: "absolute", left: colIndex * (CELL + GAP) }}>
                    <Text style={[styles.monthLabel, { color: colors.mutedForeground }]}>{label}</Text>
                  </View>
                ))}
                <View style={{ height: 16, width: weeks.length * (CELL + GAP) }} />
              </View>

              <View style={styles.gridContainer}>
                <View style={[styles.dayLabels, { gap: GAP }]}>
                  {DAYS.map((d, i) => (
                    <Text
                      key={i}
                      style={[
                        styles.dayLabel,
                        { color: colors.mutedForeground, height: CELL, lineHeight: CELL },
                      ]}
                    >
                      {d}
                    </Text>
                  ))}
                </View>

                <View style={[styles.grid, { gap: GAP }]}>
                  {weeks.map((week, wi) => (
                    <View key={wi} style={[styles.weekCol, { gap: GAP }]}>
                      {week.map((day, di) => {
                        const intensity = day.isFuture ? -1 : getIntensity(day.count);
                        return (
                          <View
                            key={di}
                            style={[
                              {
                                width: CELL,
                                height: CELL,
                                borderRadius: Math.max(3, CELL * 0.22),
                                backgroundColor: intensity < 0 ? "transparent" : intensityColors[intensity],
                                borderWidth: day.isToday ? 2 : 0,
                                borderColor: day.isToday ? colors.gold : "transparent",
                              },
                            ]}
                          />
                        );
                      })}
                    </View>
                  ))}
                </View>
              </View>

              <View style={[styles.legendRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
                <Text style={[styles.legendLabel, { color: colors.mutedForeground }]}>{t("less")}</Text>
                {[0, 1, 2, 3, 4].map((i) => (
                  <View key={i} style={{ width: CELL, height: CELL, borderRadius: Math.max(3, CELL * 0.22), backgroundColor: intensityColors[i] }} />
                ))}
                <Text style={[styles.legendLabel, { color: colors.mutedForeground }]}>{t("more")}</Text>
              </View>
            </View>
          </ScrollView>
        </View>

        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={styles.statEmoji}>🕌</Text>
            <Text style={[styles.statVal, { color: colors.foreground }]}>
              {totalPrayersInHistory.toLocaleString()}
            </Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{t("totalLogged")}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={styles.statEmoji}>⚡</Text>
            <Text style={[styles.statVal, { color: colors.foreground }]}>{bestDay}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{t("bestDay")}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={styles.statEmoji}>📈</Text>
            <Text style={[styles.statVal, { color: colors.foreground }]}>
              {totalDaysLogged > 0 ? (totalPrayersInHistory / totalDaysLogged).toFixed(1) : "0"}
            </Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{t("avgActiveDays")}</Text>
          </View>
        </View>

        {totalDaysLogged === 0 && (
          <View style={[styles.emptyState, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={styles.emptyEmoji}>🌙</Text>
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>{t("noHistory")}</Text>
            <Text style={[styles.emptySub, { color: colors.mutedForeground, textAlign: "center" }]}>
              {t("noHistoryDesc")}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingHorizontal: 16 },
  pageTitle: { fontSize: 24, fontFamily: "Inter_700Bold", marginBottom: 16 },
  streakRow: { flexDirection: "row", gap: 8, marginBottom: 14 },
  streakCard: {
    flex: 1, alignItems: "center", paddingVertical: 14,
    borderRadius: 14, borderWidth: 1.5, gap: 2,
  },
  streakEmoji: { fontSize: 20 },
  streakNum: { fontSize: 22, fontFamily: "Inter_700Bold" },
  streakLabel: { fontSize: 10, fontFamily: "Inter_400Regular", textAlign: "center" },
  calCard: { borderRadius: 18, borderWidth: 1, padding: 16, marginBottom: 14, overflow: "hidden" },
  calTitle: { fontSize: 15, fontFamily: "Inter_700Bold", marginBottom: 2 },
  calSub: { fontSize: 11, fontFamily: "Inter_400Regular", marginBottom: 12 },
  calScroll: { marginHorizontal: -4 },
  monthRow: { position: "relative", marginLeft: 24, paddingLeft: 4 },
  monthLabel: { fontSize: 10, fontFamily: "Inter_600SemiBold" },
  gridContainer: { flexDirection: "row" },
  dayLabels: { width: 20, paddingTop: 0 },
  dayLabel: { fontSize: 9, fontFamily: "Inter_400Regular", textAlign: "right" },
  grid: { flexDirection: "row", paddingLeft: 4 },
  weekCol: { flexDirection: "column" },
  legendRow: { alignItems: "center", gap: 4, marginTop: 10, marginLeft: 24 },
  legendLabel: { fontSize: 9, fontFamily: "Inter_400Regular", marginRight: 2 },
  statsGrid: { flexDirection: "row", gap: 8, marginBottom: 16 },
  statCard: { flex: 1, borderRadius: 14, borderWidth: 1, padding: 14, alignItems: "center", gap: 4 },
  statEmoji: { fontSize: 20 },
  statVal: { fontSize: 18, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 10, fontFamily: "Inter_400Regular", textAlign: "center" },
  emptyState: { borderRadius: 16, borderWidth: 1, padding: 28, alignItems: "center", gap: 10 },
  emptyEmoji: { fontSize: 40 },
  emptyTitle: { fontSize: 17, fontFamily: "Inter_700Bold" },
  emptySub: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 20 },
});
