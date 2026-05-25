import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useApp } from "@/context/AppContext";
import { useLocale } from "@/context/LocaleContext";
import { useColors } from "@/hooks/useColors";
import { useLayout } from "@/hooks/useLayout";
import { useTranslation } from "@/hooks/useTranslation";
import { PRAYERS, getTotalRemaining } from "@/utils/calculations";
import { clearAllData, exportDataAsJson } from "@/utils/storage";
import { LANGUAGE_OPTIONS, type Language } from "@/utils/translations";
import type { TranslationKey } from "@/utils/translations";

export default function SettingsScreen() {
  const colors = useColors();
  const { topPad, scrollBottom, isSmall } = useLayout();
  const { t, isRTL } = useTranslation();
  const { language, setLanguage } = useLocale();
  const { userProfile, initialCounts, currentCounts, resetProgress } = useApp();
  const [exporting, setExporting] = useState(false);
  const [langModalVisible, setLangModalVisible] = useState(false);

  async function handleExport() {
    setExporting(true);
    try {
      const json = await exportDataAsJson();
      Alert.alert(
        t("exportData"),
        t("exportPreview") + "\n\n" + json.slice(0, 150) + "..."
      );
    } finally {
      setExporting(false);
    }
  }

  function handleRecalculate() {
    Alert.alert(t("recalcConfirmTitle"), t("recalcConfirmMsg"), [
      { text: t("cancel"), style: "cancel" },
      {
        text: t("proceed"),
        style: "destructive",
        onPress: async () => {
          await clearAllData();
          router.replace("/onboarding");
        },
      },
    ]);
  }

  function handleResetProgress() {
    Alert.alert(t("resetConfirmTitle"), t("resetConfirmMsg"), [
      { text: t("cancel"), style: "cancel" },
      {
        text: t("reset"),
        style: "destructive",
        onPress: async () => {
          if (Platform.OS !== "web") {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          }
          await resetProgress();
        },
      },
    ]);
  }

  const currentLangOption = LANGUAGE_OPTIONS.find((l) => l.code === language);
  const genderKey: TranslationKey = userProfile?.gender === "female" ? "female" : "male";
  const lapsedYears = userProfile ? userProfile.currentAge - userProfile.pubertyAge : 0;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: topPad + 16, paddingBottom: scrollBottom },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text
          style={[styles.pageTitle, { color: colors.foreground, textAlign: isRTL ? "right" : "left" }]}
        >
          {t("settings")}
        </Text>

        {/* Language */}
        <SectionLabel label={t("language")} isRTL={isRTL} colors={colors} />
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Pressable
            style={[rowStyles.actionRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}
            onPress={() => setLangModalVisible(true)}
          >
            <View style={[rowStyles.actionIcon, { backgroundColor: colors.emeraldLight }]}>
              <Feather name="globe" size={16} color={colors.emerald} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[rowStyles.actionLabel, { color: colors.foreground, textAlign: isRTL ? "right" : "left" }]}>
                {currentLangOption?.nativeLabel ?? "English"}
              </Text>
              <Text style={[rowStyles.actionSub, { color: colors.mutedForeground, textAlign: isRTL ? "right" : "left" }]}>
                {currentLangOption?.label ?? "English"}
              </Text>
            </View>
            <Feather
              name={isRTL ? "chevron-left" : "chevron-right"}
              size={16}
              color={colors.mutedForeground}
            />
          </Pressable>
        </View>

        {/* Profile */}
        <SectionLabel label={t("yourProfile")} isRTL={isRTL} colors={colors} />
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <InfoRow label={t("gender")} value={t(genderKey)} isRTL={isRTL} colors={colors} />
          <Divider colors={colors} />
          <InfoRow
            label={t("ageAtPuberty")}
            value={`${userProfile?.pubertyAge ?? "—"} ${t("years")}`}
            isRTL={isRTL}
            colors={colors}
          />
          <Divider colors={colors} />
          <InfoRow
            label={t("currentAge")}
            value={`${userProfile?.currentAge ?? "—"} ${t("years")}`}
            isRTL={isRTL}
            colors={colors}
          />
          <Divider colors={colors} />
          <InfoRow
            label={t("yearsOfQaza")}
            value={`${lapsedYears} ${t("years")}`}
            isRTL={isRTL}
            colors={colors}
          />
          {userProfile?.gender === "female" && (
            <>
              <Divider colors={colors} />
              <InfoRow
                label={t("mensDaysPerMonth")}
                value={`${userProfile.mensDaysPerMonth} ${t("days")}`}
                isRTL={isRTL}
                colors={colors}
              />
            </>
          )}
        </View>

        {/* Prayer Breakdown */}
        <SectionLabel label={t("prayerBreakdown")} isRTL={isRTL} colors={colors} />
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {PRAYERS.map((prayer, i) => {
            const prayerNameKey = prayer.key as TranslationKey;
            const typeKey: TranslationKey = prayer.type === "Farz" ? "farz" : "wajib";
            return (
              <React.Fragment key={prayer.key}>
                {i > 0 && <Divider colors={colors} />}
                <View style={[styles.prayerRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
                  <View style={[styles.prayerDot, { backgroundColor: prayer.color }]} />
                  <Text style={[styles.prayerName, { color: colors.foreground }]}>
                    {t(prayerNameKey)}
                  </Text>
                  <Text style={[styles.prayerInfo, { color: colors.mutedForeground }]}>
                    {prayer.rakaat} {t(typeKey)}
                  </Text>
                  <Text style={[styles.prayerCount, { color: colors.foreground, textAlign: isRTL ? "left" : "right" }]}>
                    {currentCounts ? currentCounts[prayer.key].toLocaleString() : "—"} {t("left_label")}
                  </Text>
                </View>
              </React.Fragment>
            );
          })}
        </View>

        {/* Data */}
        <SectionLabel label={t("data")} isRTL={isRTL} colors={colors} />
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ActionRow
            icon="download"
            label={t("exportData")}
            subtitle={t("exportDataDesc")}
            onPress={handleExport}
            isRTL={isRTL}
            colors={colors}
            loading={exporting}
          />
          <Divider colors={colors} />
          <ActionRow
            icon="refresh-cw"
            label={t("recalculate")}
            subtitle={t("recalculateDesc")}
            onPress={handleRecalculate}
            isRTL={isRTL}
            colors={colors}
          />
        </View>

        {/* Danger Zone */}
        <SectionLabel label={t("dangerZone")} isRTL={isRTL} colors={colors} />
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ActionRow
            icon="rotate-ccw"
            label={t("resetProgress")}
            subtitle={t("resetProgressDesc")}
            onPress={handleResetProgress}
            isRTL={isRTL}
            colors={colors}
            destructive
          />
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.mutedForeground }]}>
            {t("appName")}
          </Text>
          <Text style={[styles.footerSub, { color: colors.mutedForeground }]}>
            {t("footerDua")}
          </Text>
        </View>
      </ScrollView>

      {/* Language Modal */}
      <Modal
        visible={langModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setLangModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setLangModalVisible(false)}>
          <Pressable
            style={[styles.modalSheet, { backgroundColor: colors.card }]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={[styles.modalHandle, { backgroundColor: colors.border }]} />
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>
              {t("selectLanguage")}
            </Text>
            {LANGUAGE_OPTIONS.map((lang, i) => {
              const isSelected = language === lang.code;
              return (
                <React.Fragment key={lang.code}>
                  {i > 0 && <View style={[styles.modalDivider, { backgroundColor: colors.border }]} />}
                  <Pressable
                    style={[
                      styles.langRow,
                      isSelected && { backgroundColor: colors.emeraldLight + "88" },
                    ]}
                    onPress={() => {
                      setLanguage(lang.code as Language);
                      setLangModalVisible(false);
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.langNative, { color: colors.foreground }]}>
                        {lang.nativeLabel}
                      </Text>
                      <Text style={[styles.langEnglish, { color: colors.mutedForeground }]}>
                        {lang.label}
                      </Text>
                    </View>
                    {isSelected && (
                      <View style={[styles.langCheck, { backgroundColor: colors.emerald }]}>
                        <Feather name="check" size={13} color="#FFFFFF" />
                      </View>
                    )}
                    {lang.rtl && (
                      <View style={[styles.rtlBadge, { borderColor: colors.gold }]}>
                        <Text style={[styles.rtlBadgeText, { color: colors.gold }]}>RTL</Text>
                      </View>
                    )}
                  </Pressable>
                </React.Fragment>
              );
            })}
            <Pressable
              style={[styles.closeBtn, { borderColor: colors.border }]}
              onPress={() => setLangModalVisible(false)}
            >
              <Text style={[styles.closeBtnText, { color: colors.mutedForeground }]}>
                {t("cancel")}
              </Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

function SectionLabel({ label, isRTL, colors }: { label: string; isRTL: boolean; colors: ReturnType<typeof useColors> }) {
  return (
    <Text
      style={[
        sectionStyles.label,
        { color: colors.mutedForeground, textAlign: isRTL ? "right" : "left" },
      ]}
    >
      {label}
    </Text>
  );
}

function InfoRow({
  label, value, isRTL, colors,
}: {
  label: string; value: string; isRTL: boolean; colors: ReturnType<typeof useColors>;
}) {
  return (
    <View style={[rowStyles.row, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
      <Text style={[rowStyles.label, { color: colors.mutedForeground }]}>{label}</Text>
      <Text style={[rowStyles.value, { color: colors.foreground }]}>{value}</Text>
    </View>
  );
}

function ActionRow({
  icon, label, subtitle, onPress, isRTL, colors, destructive, loading,
}: {
  icon: string; label: string; subtitle: string; onPress: () => void;
  isRTL: boolean; colors: ReturnType<typeof useColors>; destructive?: boolean; loading?: boolean;
}) {
  const tint = destructive ? colors.destructive : colors.emerald;
  return (
    <Pressable
      style={[rowStyles.actionRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}
      onPress={onPress}
      disabled={loading}
    >
      <View style={[rowStyles.actionIcon, { backgroundColor: destructive ? "#FEE2E2" : colors.emeraldLight }]}>
        <Feather name={icon as any} size={16} color={tint} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[rowStyles.actionLabel, { color: destructive ? colors.destructive : colors.foreground, textAlign: isRTL ? "right" : "left" }]}>
          {label}
        </Text>
        <Text style={[rowStyles.actionSub, { color: colors.mutedForeground, textAlign: isRTL ? "right" : "left" }]}>
          {subtitle}
        </Text>
      </View>
      <Feather
        name={isRTL ? "chevron-left" : "chevron-right"}
        size={16}
        color={colors.mutedForeground}
      />
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
    fontSize: 12, fontFamily: "Inter_600SemiBold", letterSpacing: 0.8,
    textTransform: "uppercase", marginTop: 24, marginBottom: 8, marginLeft: 4,
  },
});

const rowStyles = StyleSheet.create({
  row: { justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14 },
  label: { fontSize: 14, fontFamily: "Inter_400Regular" },
  value: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  actionRow: { alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, gap: 14 },
  actionIcon: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  actionLabel: { fontSize: 15, fontFamily: "Inter_500Medium" },
  actionSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 1 },
});

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingHorizontal: 18 },
  pageTitle: { fontSize: 26, fontFamily: "Inter_700Bold", marginBottom: 4 },
  card: { borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  prayerRow: { alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, gap: 10 },
  prayerDot: { width: 9, height: 9, borderRadius: 5, flexShrink: 0 },
  prayerName: { fontSize: 14, fontFamily: "Inter_500Medium", flex: 1 },
  prayerInfo: { fontSize: 12, fontFamily: "Inter_400Regular" },
  prayerCount: { fontSize: 14, fontFamily: "Inter_600SemiBold", minWidth: 60 },
  footer: { marginTop: 40, alignItems: "center", paddingBottom: 8 },
  footerText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  footerSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 4, textAlign: "center" },
  // Modal
  modalOverlay: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end",
  },
  modalSheet: {
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 20, paddingTop: 12, paddingBottom: 40,
  },
  modalHandle: { width: 36, height: 4, borderRadius: 2, alignSelf: "center", marginBottom: 18 },
  modalTitle: { fontSize: 17, fontFamily: "Inter_700Bold", marginBottom: 12 },
  modalDivider: { height: 1, marginHorizontal: 0 },
  langRow: {
    flexDirection: "row", alignItems: "center",
    paddingVertical: 14, paddingHorizontal: 8,
    borderRadius: 10, gap: 12, marginVertical: 1,
  },
  langNative: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  langEnglish: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 1 },
  langCheck: {
    width: 24, height: 24, borderRadius: 12, alignItems: "center", justifyContent: "center",
  },
  rtlBadge: {
    borderWidth: 1, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2,
  },
  rtlBadgeText: { fontSize: 9, fontFamily: "Inter_700Bold", letterSpacing: 0.5 },
  closeBtn: {
    marginTop: 16, borderWidth: 1, borderRadius: 14,
    paddingVertical: 14, alignItems: "center",
  },
  closeBtnText: { fontSize: 15, fontFamily: "Inter_500Medium" },
});
