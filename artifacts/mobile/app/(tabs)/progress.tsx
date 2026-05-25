import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ProgressRing } from "@/components/ProgressRing";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import {
  PRAYERS,
  getCompletionPercent,
  getPrayerCompletionPercent,
  getTotalRemaining,
} from "@/utils/calculations";

export default function ProgressScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { currentCounts, initialCounts, totalCompleted } = useApp();

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);
  const bottomPad = insets.bottom + (Platform.OS === "web" ? 34 : 0);

  if (!currentCounts || !initialCounts) {
    return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  }

  const overallPercent = getCompletionPercent(initialCounts, currentCounts);
  const totalInitial = getTotalRemaining(initialCounts);
  const totalRemaining = getTotalRemaining(currentCounts);
  const totalCompletedCalc = totalInitial - totalRemaining;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: topPad + 16, paddingBottom: bottomPad + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.pageTitle, { color: colors.foreground }]}>Progress</Text>

        <View style={[styles.overallCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ProgressRing
            percent={overallPercent}
            size={140}
            strokeWidth={12}
            label={`${Math.round(overallPercent)}%`}
            sublabel="complete"
          />
          <View style={styles.overallStats}>
            <StatItem label="Total Days" value={totalInitial.toLocaleString()} color={colors.foreground} />
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <StatItem label="Completed" value={totalCompletedCalc.toLocaleString()} color={colors.emerald} />
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <StatItem label="Remaining" value={totalRemaining.toLocaleString()} color={colors.mutedForeground} />
          </View>
        </View>

        <View style={[styles.sessionCard, { backgroundColor: colors.goldLight, borderColor: colors.gold }]}>
          <Feather name="award" size={18} color={colors.gold} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.sessionValue, { color: colors.gold }]}>
              {totalCompleted.toLocaleString()}
            </Text>
            <Text style={[styles.sessionLabel, { color: colors.gold }]}>
              prayers logged this session
            </Text>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Per Prayer</Text>

        {PRAYERS.map((prayer) => {
          const initial = initialCounts[prayer.key];
          const current = currentCounts[prayer.key];
          const completed = initial - current;
          const pct = getPrayerCompletionPercent(initial, current);
          const isComplete = current === 0;

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
              <View style={styles.prayerLeft}>
                <View style={[styles.prayerDot, { backgroundColor: prayer.color }]} />
                <View>
                  <Text style={[styles.prayerName, { color: colors.foreground }]}>{prayer.name}</Text>
                  <Text style={[styles.prayerMeta, { color: colors.mutedForeground }]}>
                    {completed.toLocaleString()} / {initial.toLocaleString()}
                  </Text>
                </View>
              </View>

              <View style={styles.prayerRight}>
                {isComplete ? (
                  <View style={[styles.doneBadge, { backgroundColor: colors.goldLight }]}>
                    <Text style={[styles.doneBadgeText, { color: colors.gold }]}>Done</Text>
                  </View>
                ) : (
                  <Text style={[styles.prayerPct, { color: prayer.color }]}>
                    {Math.round(pct)}%
                  </Text>
                )}
              </View>

              <View style={[styles.barTrack, { backgroundColor: colors.muted }]}>
                <View
                  style={[
                    styles.barFill,
                    { width: `${pct}%` as any, backgroundColor: prayer.color },
                  ]}
                />
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

function StatItem({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={styles.statItem}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingHorizontal: 18 },
  pageTitle: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    marginBottom: 20,
  },
  overallCard: {
    borderRadius: 18,
    padding: 24,
    alignItems: "center",
    gap: 20,
    borderWidth: 1,
    marginBottom: 14,
  },
  overallStats: {
    flexDirection: "row",
    width: "100%",
    alignItems: "center",
    justifyContent: "space-around",
  },
  statItem: { alignItems: "center", gap: 4 },
  statValue: { fontSize: 20, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 11, fontFamily: "Inter_400Regular", color: "#737373" },
  statDivider: { width: 1, height: 36 },
  sessionCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    marginBottom: 24,
  },
  sessionValue: { fontSize: 22, fontFamily: "Inter_700Bold", lineHeight: 26 },
  sessionLabel: { fontSize: 13, fontFamily: "Inter_400Regular" },
  sectionTitle: { fontSize: 18, fontFamily: "Inter_700Bold", marginBottom: 12 },
  prayerRow: {
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 18,
    marginBottom: 10,
    overflow: "hidden",
  },
  prayerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  prayerDot: { width: 10, height: 10, borderRadius: 5 },
  prayerName: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  prayerMeta: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 1 },
  prayerRight: {
    position: "absolute",
    right: 16,
    top: 14,
  },
  prayerPct: { fontSize: 18, fontFamily: "Inter_700Bold" },
  doneBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  doneBadgeText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  barTrack: {
    height: 3,
    borderRadius: 2,
    marginTop: 12,
    overflow: "hidden",
  },
  barFill: { height: 3, borderRadius: 2 },
});
