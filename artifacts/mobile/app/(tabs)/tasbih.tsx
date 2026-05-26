import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { ProgressRing } from "@/components/ProgressRing";
import { useTasbih } from "@/context/TasbihContext";
import { useColors } from "@/hooks/useColors";
import { useLayout } from "@/hooks/useLayout";
import { useTranslation } from "@/hooks/useTranslation";
import { TASBIH_PRESETS } from "@/utils/tasbih";

export default function TasbihScreen() {
  const colors = useColors();
  const { topPad, scrollBottom, isSmall } = useLayout();
  const { t, isRTL } = useTranslation();
  const { counts, allTime, getTarget, increment, resetToday, setCustomTarget } = useTasbih();

  const [selectedId, setSelectedId] = useState(TASBIH_PRESETS[0].id);
  const [showTargetInput, setShowTargetInput] = useState(false);
  const [targetInput, setTargetInput] = useState("");

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const flashAnim = useRef(new Animated.Value(0)).current;
  const celebrateAnim = useRef(new Animated.Value(0)).current;

  const preset = TASBIH_PRESETS.find((p) => p.id === selectedId)!;
  const todayCount = counts[selectedId] ?? 0;
  const target = getTarget(selectedId);
  const allTimeCount = allTime[selectedId] ?? 0;
  const percent = Math.min(100, (todayCount / target) * 100);
  const isComplete = todayCount >= target;
  const justComplete = todayCount === target;

  useEffect(() => {
    if (justComplete) {
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      Animated.sequence([
        Animated.timing(celebrateAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(celebrateAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
      ]).start();
    }
  }, [justComplete]);

  function handleTap() {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    increment(selectedId);
    Animated.sequence([
      Animated.spring(scaleAnim, { toValue: 0.92, useNativeDriver: true, friction: 5 }),
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, friction: 4 }),
    ]).start();
    Animated.sequence([
      Animated.timing(flashAnim, { toValue: 1, duration: 60, useNativeDriver: false }),
      Animated.timing(flashAnim, { toValue: 0, duration: 300, useNativeDriver: false }),
    ]).start();
  }

  function handleReset() {
    Alert.alert(
      t("resetCounter"),
      `Reset ${preset.transliteration} counter?`,
      [
        { text: t("cancel"), style: "cancel" },
        {
          text: t("reset"),
          style: "destructive",
          onPress: () => resetToday(selectedId),
        },
      ]
    );
  }

  function handleSetTarget() {
    setTargetInput(String(target));
    setShowTargetInput(true);
  }

  function confirmTarget() {
    const val = parseInt(targetInput, 10);
    if (val > 0 && val <= 10000) {
      setCustomTarget(selectedId, val);
    }
    setShowTargetInput(false);
  }

  const ringBg = flashAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.card, preset.color + "22"],
  });

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: topPad + 12, paddingBottom: scrollBottom + 16 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.header, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
          <Text style={[styles.pageTitle, { color: colors.foreground }]}>{t("tasbih")}</Text>
          {isComplete && (
            <View style={[styles.doneBadge, { backgroundColor: colors.goldLight }]}>
              <Text style={[styles.doneBadgeText, { color: colors.gold }]}>
                {t("tasbihDone")}
              </Text>
            </View>
          )}
        </View>

        {/* Dhikr Selector */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selectorScroll}
          contentContainerStyle={[styles.selectorContent, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
          {TASBIH_PRESETS.map((p) => {
            const selected = p.id === selectedId;
            return (
              <Pressable
                key={p.id}
                onPress={() => setSelectedId(p.id)}
                style={[
                  styles.selectorChip,
                  {
                    backgroundColor: selected ? p.color + "22" : colors.card,
                    borderColor: selected ? p.color : colors.border,
                    borderWidth: selected ? 2 : 1,
                  },
                ]}
              >
                <Text style={[styles.chipText, { color: selected ? p.color : colors.mutedForeground }]}>
                  {p.transliteration}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Main Counter Card — Tap Zone */}
        <Animated.View
          style={[
            styles.counterCard,
            { backgroundColor: ringBg, borderColor: isComplete ? colors.gold : preset.color + "44", borderWidth: isComplete ? 2 : 1.5 },
          ]}
        >
          <Pressable onPress={handleTap} style={styles.tapZone} android_ripple={{ color: preset.color + "33" }}>
            <Text style={[styles.arabicText, { color: colors.foreground }]}>{preset.arabic}</Text>
            <Text style={[styles.translitText, { color: preset.color }]}>{preset.transliteration}</Text>
            <Text style={[styles.meaningText, { color: colors.mutedForeground }]}>{preset.meaning}</Text>

            <View style={styles.ringRow}>
              <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                <ProgressRing
                  percent={percent}
                  size={isSmall ? 140 : 170}
                  strokeWidth={isSmall ? 11 : 13}
                  label={String(todayCount)}
                  sublabel={`/ ${target}`}
                  color={isComplete ? colors.gold : preset.color}
                />
              </Animated.View>
            </View>

            <View style={[styles.tapHint, { backgroundColor: preset.color + "18" }]}>
              <Feather name="zap" size={13} color={preset.color} />
              <Text style={[styles.tapHintText, { color: preset.color }]}>{t("tapToCount")}</Text>
            </View>
          </Pressable>
        </Animated.View>

        {/* Stats Row */}
        <View style={[styles.statsRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.statVal, { color: colors.foreground }]}>{todayCount}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{t("todayTotal")}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.statVal, { color: colors.foreground }]}>{allTimeCount.toLocaleString()}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{t("allTime")}</Text>
          </View>
          <Pressable
            style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={handleSetTarget}
          >
            <Text style={[styles.statVal, { color: preset.color }]}>{target}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Target</Text>
          </Pressable>
        </View>

        {/* Virtue Card */}
        <View style={[styles.virtueCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.virtueHeader, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
            <View style={[styles.virtueDot, { backgroundColor: preset.color }]} />
            <Text style={[styles.virtueLabel, { color: preset.color }]}>{t("virtueLabel")}</Text>
          </View>
          <Text style={[styles.virtueText, { color: colors.foreground, textAlign: isRTL ? "right" : "left" }]}>
            {preset.virtue}
          </Text>
        </View>

        {/* All Presets Quick View */}
        <Text style={[styles.sectionTitle, { color: colors.foreground, textAlign: isRTL ? "right" : "left" }]}>
          All Dhikr Today
        </Text>
        {TASBIH_PRESETS.map((p) => {
          const c = counts[p.id] ?? 0;
          const tgt = getTarget(p.id);
          const done = c >= tgt;
          return (
            <Pressable
              key={p.id}
              onPress={() => setSelectedId(p.id)}
              style={[
                styles.allRow,
                {
                  backgroundColor: colors.card,
                  borderColor: p.id === selectedId ? p.color : colors.border,
                  borderWidth: p.id === selectedId ? 1.5 : 1,
                },
              ]}
            >
              <View style={[styles.allDot, { backgroundColor: p.color + "33", borderRadius: 10 }]}>
                <View style={[styles.allDotInner, { backgroundColor: p.color }]} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.allName, { color: colors.foreground, textAlign: isRTL ? "right" : "left" }]}>
                  {p.transliteration}
                </Text>
                <Text style={[styles.allArabic, { color: colors.mutedForeground, textAlign: isRTL ? "right" : "left" }]}>
                  {p.arabic}
                </Text>
              </View>
              <View style={styles.allRight}>
                <Text style={[styles.allCount, { color: done ? colors.gold : p.color }]}>
                  {c}/{tgt}
                </Text>
                {done && <Text style={styles.checkMark}>✓</Text>}
              </View>
            </Pressable>
          );
        })}

        {/* Reset Button */}
        <Pressable
          onPress={handleReset}
          style={[styles.resetBtn, { borderColor: colors.border }]}
        >
          <Feather name="rotate-ccw" size={14} color={colors.mutedForeground} />
          <Text style={[styles.resetText, { color: colors.mutedForeground }]}>
            {t("resetCounter")} {preset.transliteration}
          </Text>
        </Pressable>
      </ScrollView>

      {/* Target Input Modal */}
      {showTargetInput && (
        <View style={[styles.targetOverlay, { backgroundColor: "rgba(0,0,0,0.45)" }]}>
          <View style={[styles.targetSheet, { backgroundColor: colors.card }]}>
            <Text style={[styles.targetTitle, { color: colors.foreground }]}>
              Set Target for {preset.transliteration}
            </Text>
            <TextInput
              style={[styles.targetInput, { color: colors.foreground, borderColor: preset.color }]}
              value={targetInput}
              onChangeText={setTargetInput}
              keyboardType="number-pad"
              autoFocus
              maxLength={5}
            />
            <View style={styles.targetBtns}>
              <Pressable style={[styles.targetBtn, { borderColor: colors.border }]} onPress={() => setShowTargetInput(false)}>
                <Text style={{ color: colors.mutedForeground }}>{t("cancel")}</Text>
              </Pressable>
              <Pressable style={[styles.targetBtn, { backgroundColor: preset.color }]} onPress={confirmTarget}>
                <Text style={{ color: "#FFF", fontFamily: "Inter_600SemiBold" }}>Set</Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingHorizontal: 16 },
  header: { alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 },
  pageTitle: { fontSize: 24, fontFamily: "Inter_700Bold" },
  doneBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  doneBadgeText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  selectorScroll: { marginBottom: 14, marginHorizontal: -16 },
  selectorContent: { paddingHorizontal: 16, gap: 8 },
  selectorChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  chipText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  counterCard: { borderRadius: 22, overflow: "hidden", marginBottom: 12 },
  tapZone: { padding: 20, alignItems: "center", gap: 6, minHeight: 300 },
  arabicText: { fontSize: 28, textAlign: "center", lineHeight: 44, fontFamily: "Inter_400Regular" },
  translitText: { fontSize: 15, fontFamily: "Inter_700Bold", textAlign: "center" },
  meaningText: { fontSize: 12, fontFamily: "Inter_400Regular", textAlign: "center" },
  ringRow: { paddingVertical: 12 },
  tapHint: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20 },
  tapHintText: { fontSize: 12, fontFamily: "Inter_500Medium" },
  statsRow: { gap: 8, marginBottom: 12 },
  statCard: { flex: 1, alignItems: "center", paddingVertical: 14, borderRadius: 14, borderWidth: 1 },
  statVal: { fontSize: 20, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 10, fontFamily: "Inter_400Regular", marginTop: 2 },
  virtueCard: { borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 16 },
  virtueHeader: { alignItems: "center", gap: 7, marginBottom: 6 },
  virtueDot: { width: 6, height: 6, borderRadius: 3 },
  virtueLabel: { fontSize: 10, fontFamily: "Inter_700Bold", textTransform: "uppercase", letterSpacing: 0.8 },
  virtueText: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 20 },
  sectionTitle: { fontSize: 15, fontFamily: "Inter_700Bold", marginBottom: 8 },
  allRow: { flexDirection: "row", alignItems: "center", borderRadius: 14, padding: 12, marginBottom: 8, gap: 12 },
  allDot: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  allDotInner: { width: 10, height: 10, borderRadius: 5 },
  allName: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  allArabic: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 1 },
  allRight: { alignItems: "flex-end" },
  allCount: { fontSize: 14, fontFamily: "Inter_700Bold" },
  checkMark: { fontSize: 12 },
  resetBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 13, borderRadius: 12, borderWidth: 1, marginTop: 6 },
  resetText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  targetOverlay: { ...StyleSheet.absoluteFillObject, alignItems: "center", justifyContent: "flex-end" },
  targetSheet: { width: "100%", padding: 24, paddingBottom: 40, borderTopLeftRadius: 20, borderTopRightRadius: 20, gap: 16 },
  targetTitle: { fontSize: 16, fontFamily: "Inter_700Bold", textAlign: "center" },
  targetInput: { borderWidth: 2, borderRadius: 12, padding: 14, fontSize: 28, fontFamily: "Inter_700Bold", textAlign: "center" },
  targetBtns: { flexDirection: "row", gap: 12 },
  targetBtn: { flex: 1, padding: 14, borderRadius: 12, alignItems: "center", borderWidth: 1 },
});
