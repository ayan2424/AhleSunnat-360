import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { clearAllData, exportDataAsJson } from "@/utils/storage";
import { PRAYERS, getTotalRemaining } from "@/utils/calculations";

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { userProfile, initialCounts, currentCounts, resetProgress } = useApp();
  const [exporting, setExporting] = useState(false);

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);
  const bottomPad = insets.bottom + (Platform.OS === "web" ? 34 : 0);

  async function handleExport() {
    setExporting(true);
    try {
      const json = await exportDataAsJson();
      Alert.alert("Export Data", "Your data has been prepared. In a full build, this would save to your device or share via the system share sheet.\n\nData preview:\n" + json.slice(0, 200) + "...");
    } finally {
      setExporting(false);
    }
  }

  function handleRecalculate() {
    Alert.alert(
      "Recalculate",
      "This will restart the onboarding and recalculate your Qaza count. Your progress will be reset.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Proceed",
          style: "destructive",
          onPress: async () => {
            await clearAllData();
            router.replace("/onboarding");
          },
        },
      ]
    );
  }

  function handleResetProgress() {
    Alert.alert(
      "Reset Progress",
      "This will reset all your logged Qaza prayers back to the initial count. Your profile settings will remain.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            if (Platform.OS !== "web") {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            }
            await resetProgress();
          },
        },
      ]
    );
  }

  const genderLabel = userProfile?.gender === "female" ? "Female" : "Male";
  const lapsedYears = userProfile ? userProfile.currentAge - userProfile.pubertyAge : 0;
  const totalInitial = initialCounts ? getTotalRemaining(initialCounts) : 0;
  const totalRemaining = currentCounts ? getTotalRemaining(currentCounts) : 0;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: topPad + 16, paddingBottom: bottomPad + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.pageTitle, { color: colors.foreground }]}>Settings</Text>

        <SectionLabel label="Your Profile" colors={colors} />
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <InfoRow label="Gender" value={genderLabel} colors={colors} />
          <Divider colors={colors} />
          <InfoRow label="Age at Puberty" value={`${userProfile?.pubertyAge ?? "—"} years`} colors={colors} />
          <Divider colors={colors} />
          <InfoRow label="Current Age" value={`${userProfile?.currentAge ?? "—"} years`} colors={colors} />
          <Divider colors={colors} />
          <InfoRow label="Years of Qaza" value={`${lapsedYears} years`} colors={colors} />
          {userProfile?.gender === "female" && (
            <>
              <Divider colors={colors} />
              <InfoRow label="Menstruation Days/Month" value={`${userProfile.mensDaysPerMonth} days`} colors={colors} />
            </>
          )}
        </View>

        <SectionLabel label="Prayer Breakdown" colors={colors} />
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {PRAYERS.map((prayer, i) => (
            <React.Fragment key={prayer.key}>
              {i > 0 && <Divider colors={colors} />}
              <View style={styles.prayerRow}>
                <View style={[styles.prayerDot, { backgroundColor: prayer.color }]} />
                <Text style={[styles.prayerName, { color: colors.foreground }]}>{prayer.name}</Text>
                <Text style={[styles.prayerInfo, { color: colors.mutedForeground }]}>
                  {prayer.rakaat} {prayer.type}
                </Text>
                <Text style={[styles.prayerCount, { color: colors.foreground }]}>
                  {currentCounts ? currentCounts[prayer.key].toLocaleString() : "—"} left
                </Text>
              </View>
            </React.Fragment>
          ))}
        </View>

        <SectionLabel label="Data" colors={colors} />
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ActionRow
            icon="download"
            label="Export Data"
            subtitle="Save progress as JSON"
            onPress={handleExport}
            colors={colors}
            loading={exporting}
          />
          <Divider colors={colors} />
          <ActionRow
            icon="refresh-cw"
            label="Recalculate"
            subtitle="Update your profile and restart"
            onPress={handleRecalculate}
            colors={colors}
          />
        </View>

        <SectionLabel label="Danger Zone" colors={colors} />
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ActionRow
            icon="rotate-ccw"
            label="Reset Progress"
            subtitle="Restore all counts to initial"
            onPress={handleResetProgress}
            colors={colors}
            destructive
          />
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.mutedForeground }]}>
            Qaza Namaz Tracker
          </Text>
          <Text style={[styles.footerSub, { color: colors.mutedForeground }]}>
            May Allah accept all your prayers. Ameen.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

function SectionLabel({ label, colors }: { label: string; colors: ReturnType<typeof useColors> }) {
  return (
    <Text style={[sectionStyles.label, { color: colors.mutedForeground }]}>{label}</Text>
  );
}

function InfoRow({ label, value, colors }: { label: string; value: string; colors: ReturnType<typeof useColors> }) {
  return (
    <View style={rowStyles.row}>
      <Text style={[rowStyles.label, { color: colors.mutedForeground }]}>{label}</Text>
      <Text style={[rowStyles.value, { color: colors.foreground }]}>{value}</Text>
    </View>
  );
}

function ActionRow({
  icon, label, subtitle, onPress, colors, destructive, loading,
}: {
  icon: string;
  label: string;
  subtitle: string;
  onPress: () => void;
  colors: ReturnType<typeof useColors>;
  destructive?: boolean;
  loading?: boolean;
}) {
  const tint = destructive ? colors.destructive : colors.emerald;
  return (
    <Pressable style={rowStyles.actionRow} onPress={onPress} disabled={loading}>
      <View style={[rowStyles.actionIcon, { backgroundColor: destructive ? "#FEE2E2" : colors.emeraldLight }]}>
        <Feather name={icon as any} size={16} color={tint} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[rowStyles.actionLabel, { color: destructive ? colors.destructive : colors.foreground }]}>{label}</Text>
        <Text style={[rowStyles.actionSub, { color: colors.mutedForeground }]}>{subtitle}</Text>
      </View>
      <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
    </Pressable>
  );
}

function Divider({ colors }: { colors: ReturnType<typeof useColors> }) {
  return <View style={[dividerStyle.divider, { backgroundColor: colors.border }]} />;
}

const dividerStyle = StyleSheet.create({
  divider: { height: 1, marginHorizontal: 16 },
});

const sectionStyles = StyleSheet.create({
  label: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginTop: 24,
    marginBottom: 8,
    marginLeft: 4,
  },
});

const rowStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  label: { fontSize: 14, fontFamily: "Inter_400Regular" },
  value: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 14,
  },
  actionIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  actionLabel: { fontSize: 15, fontFamily: "Inter_500Medium" },
  actionSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 1 },
});

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingHorizontal: 18 },
  pageTitle: { fontSize: 26, fontFamily: "Inter_700Bold", marginBottom: 4 },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  prayerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  prayerDot: { width: 9, height: 9, borderRadius: 5 },
  prayerName: { fontSize: 14, fontFamily: "Inter_500Medium", flex: 1 },
  prayerInfo: { fontSize: 12, fontFamily: "Inter_400Regular" },
  prayerCount: { fontSize: 14, fontFamily: "Inter_600SemiBold", minWidth: 60, textAlign: "right" },
  footer: { marginTop: 40, alignItems: "center", paddingBottom: 8 },
  footerText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  footerSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 4, textAlign: "center" },
});
