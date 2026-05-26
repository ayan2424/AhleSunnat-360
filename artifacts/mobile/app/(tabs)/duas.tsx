import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useColors } from "@/hooks/useColors";
import { useLayout } from "@/hooks/useLayout";
import { useTranslation } from "@/hooks/useTranslation";
import { DUAS, DUA_CATEGORIES, type Dua, type DuaCategory } from "@/utils/duas";

const DONE_KEY = "@qaza_duas_done";

function getTodayKey() {
  return new Date().toISOString().split("T")[0];
}

export default function DuasScreen() {
  const colors = useColors();
  const { topPad, scrollBottom } = useLayout();
  const { t, isRTL } = useTranslation();

  const [category, setCategory] = useState<DuaCategory>("morning");
  const [doneDuas, setDoneDuas] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadDone();
  }, []);

  async function loadDone() {
    try {
      const raw = await AsyncStorage.getItem(DONE_KEY);
      if (raw) {
        const saved: { date: string; ids: string[] } = JSON.parse(raw);
        if (saved.date === getTodayKey()) {
          setDoneDuas(new Set(saved.ids));
        }
      }
    } catch (_) {}
  }

  async function toggleDone(id: string) {
    const next = new Set(doneDuas);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setDoneDuas(next);
    try {
      await AsyncStorage.setItem(
        DONE_KEY,
        JSON.stringify({ date: getTodayKey(), ids: Array.from(next) })
      );
    } catch (_) {}
  }

  function toggleExpand(id: string) {
    const next = new Set(expanded);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpanded(next);
  }

  const filtered = DUAS.filter((d) => d.category === category);
  const doneCount = filtered.filter((d) => doneDuas.has(d.id)).length;

  const categoryLabels: Record<DuaCategory, string> = {
    morning: t("morningAzkar"),
    evening: t("eveningAzkar"),
    afterSalah: t("afterSalah"),
    special: t("specialDuas"),
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: topPad + 12, paddingBottom: scrollBottom }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.pageTitle, { color: colors.foreground, textAlign: isRTL ? "right" : "left" }]}>
          {t("azkar")}
        </Text>

        {/* Category Tabs */}
        <View style={[styles.catRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
          {DUA_CATEGORIES.map(({ key, icon }) => {
            const sel = key === category;
            return (
              <Pressable
                key={key}
                onPress={() => setCategory(key)}
                style={[
                  styles.catBtn,
                  {
                    backgroundColor: sel ? colors.emerald : colors.card,
                    borderColor: sel ? colors.emerald : colors.border,
                    flex: 1,
                  },
                ]}
              >
                <Text style={styles.catIcon}>{icon}</Text>
                <Text style={[styles.catLabel, { color: sel ? "#FFF" : colors.mutedForeground }]}>
                  {categoryLabels[key]}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Progress for this category */}
        <View style={[styles.progressRow, { flexDirection: isRTL ? "row-reverse" : "row", backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.progressText, { color: colors.foreground }]}>
            {doneCount}/{filtered.length} {t("doneToday")}
          </Text>
          <View style={[styles.progressTrack, { backgroundColor: colors.muted }]}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${filtered.length > 0 ? (doneCount / filtered.length) * 100 : 0}%` as any,
                  backgroundColor: colors.emerald,
                },
              ]}
            />
          </View>
        </View>

        {/* Duas List */}
        {filtered.map((dua) => {
          const isDone = doneDuas.has(dua.id);
          const isExpanded = expanded.has(dua.id);

          return (
            <View
              key={dua.id}
              style={[
                styles.duaCard,
                {
                  backgroundColor: isDone ? colors.emeraldLight + "55" : colors.card,
                  borderColor: isDone ? colors.emerald : colors.border,
                  borderWidth: isDone ? 1.5 : 1,
                },
              ]}
            >
              {/* Card Header */}
              <Pressable
                onPress={() => toggleExpand(dua.id)}
                style={[styles.duaHeader, { flexDirection: isRTL ? "row-reverse" : "row" }]}
              >
                <View style={[styles.duaTitleArea, { alignItems: isRTL ? "flex-end" : "flex-start" }]}>
                  <Text style={[styles.duaTitle, { color: isDone ? colors.emerald : colors.foreground }]}>
                    {dua.title}
                  </Text>
                  {dua.count && dua.count > 1 && (
                    <View style={[styles.countPill, { backgroundColor: colors.muted }]}>
                      <Text style={[styles.countPillText, { color: colors.mutedForeground }]}>
                        ×{dua.count}
                      </Text>
                    </View>
                  )}
                </View>
                <View style={[styles.duaHeaderRight, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
                  <Feather name={isExpanded ? "chevron-up" : "chevron-down"} size={16} color={colors.mutedForeground} />
                </View>
              </Pressable>

              {/* Arabic Text — always visible */}
              <Text style={[styles.arabicText, { color: colors.foreground }]}>
                {dua.arabic}
              </Text>

              {/* Expanded content */}
              {isExpanded && (
                <View style={styles.expandedContent}>
                  <View style={[styles.divider, { backgroundColor: colors.border }]} />
                  <Text style={[styles.translitText, { color: colors.mutedForeground, textAlign: isRTL ? "right" : "left" }]}>
                    {dua.transliteration}
                  </Text>
                  <Text style={[styles.translationText, { color: colors.foreground, textAlign: isRTL ? "right" : "left" }]}>
                    "{dua.translation}"
                  </Text>
                  <View style={[styles.sourceRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
                    <Feather name="book" size={11} color={colors.gold} />
                    <Text style={[styles.sourceText, { color: colors.gold }]}>{dua.source}</Text>
                  </View>
                </View>
              )}

              {/* Mark Done Button */}
              <Pressable
                onPress={() => toggleDone(dua.id)}
                style={[
                  styles.doneBtn,
                  {
                    backgroundColor: isDone ? colors.emerald : colors.muted,
                    flexDirection: isRTL ? "row-reverse" : "row",
                  },
                ]}
              >
                <Feather
                  name={isDone ? "check-circle" : "circle"}
                  size={14}
                  color={isDone ? "#FFF" : colors.mutedForeground}
                />
                <Text style={[styles.doneBtnText, { color: isDone ? "#FFF" : colors.mutedForeground }]}>
                  {isDone ? t("doneToday") : t("markDone")}
                </Text>
              </Pressable>
            </View>
          );
        })}

        {/* Bottom note */}
        <Text style={[styles.footNote, { color: colors.mutedForeground, textAlign: "center" }]}>
          اللَّهُمَّ أَعِنَّا عَلَى ذِكْرِكَ
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingHorizontal: 16 },
  pageTitle: { fontSize: 24, fontFamily: "Inter_700Bold", marginBottom: 14 },
  catRow: { gap: 6, marginBottom: 12 },
  catBtn: { alignItems: "center", paddingVertical: 8, paddingHorizontal: 4, borderRadius: 12, borderWidth: 1, gap: 3 },
  catIcon: { fontSize: 16 },
  catLabel: { fontSize: 10, fontFamily: "Inter_600SemiBold", textAlign: "center" },
  progressRow: { borderRadius: 12, borderWidth: 1, padding: 12, marginBottom: 14, gap: 10, alignItems: "center" },
  progressText: { fontSize: 13, fontFamily: "Inter_600SemiBold", minWidth: 90 },
  progressTrack: { flex: 1, height: 6, borderRadius: 3, overflow: "hidden" },
  progressFill: { height: 6, borderRadius: 3 },
  duaCard: { borderRadius: 16, padding: 14, marginBottom: 10 },
  duaHeader: { alignItems: "center", justifyContent: "space-between", marginBottom: 10, gap: 8 },
  duaTitleArea: { flex: 1, gap: 4 },
  duaTitle: { fontSize: 14, fontFamily: "Inter_700Bold" },
  countPill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, alignSelf: "flex-start" },
  countPillText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  duaHeaderRight: { alignItems: "center", gap: 10 },
  arabicText: { fontSize: 18, lineHeight: 34, textAlign: "right", fontFamily: "Inter_400Regular", marginBottom: 10 },
  expandedContent: { gap: 8 },
  divider: { height: 1, marginVertical: 2 },
  translitText: { fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 19, fontStyle: "italic" },
  translationText: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 21 },
  sourceRow: { alignItems: "center", gap: 5 },
  sourceText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  doneBtn: { alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 9, borderRadius: 10, marginTop: 10 },
  doneBtnText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  footNote: { fontSize: 16, marginTop: 20, marginBottom: 8, lineHeight: 28 },
});
