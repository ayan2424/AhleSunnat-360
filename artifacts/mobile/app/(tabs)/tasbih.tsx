import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Modal,
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
      Animated.spring(scaleAnim, { toValue: 0.91, useNativeDriver: true, friction: 5 }),
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, friction: 4 }),
    ]).start();
    Animated.sequence([
      Animated.timing(flashAnim, { toValue: 1, duration: 55, useNativeDriver: true }),
      Animated.timing(flashAnim, { toValue: 0, duration: 320, useNativeDriver: true }),
    ]).start();
  }

  function handleReset() {
    Alert.alert(
      t("resetCounter"),
      `Reset ${preset.transliteration} counter?`,
      [
        { text: t("cancel"), style: "cancel" },
        { text: t("reset"), style: "destructive", onPress: () => resetToday(selectedId) },
      ]
    );
  }

  function handleSetTarget() {
    setTargetInput(String(target));
    setShowTargetInput(true);
  }

  function confirmTarget() {
    const val = parseInt(targetInput, 10);
    if (val > 0 && val <= 10000) setCustomTarget(selectedId, val);
    setShowTargetInput(false);
  }

  const cardGradientColors: [string, string] = isComplete
    ? [colors.goldLight, colors.goldLight + "55"]
    : [preset.color + "1C", preset.color + "08"];

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: topPad + 12, paddingBottom: scrollBottom + 16 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={[styles.header, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
          <Text style={[styles.pageTitle, { color: colors.foreground }]}>{t("tasbih")}</Text>
          {isComplete && (
            <View style={[styles.doneBadge, { backgroundColor: colors.goldLight }]}>
              <Feather name="check-circle" size={13} color={colors.gold} />
              <Text style={[styles.doneBadgeText, { color: colors.gold }]}>{t("tasbihDone")}</Text>
            </View>
          )}
        </View>

        {/* Dhikr Selector */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.selectorScroll}
          contentContainerStyle={[styles.selectorContent, { flexDirection: isRTL ? "row-reverse" : "row" }]}
        >
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
                    borderColor: selected ? p.color : "transparent",
                    borderWidth: selected ? 2 : 0,
                    shadowColor: selected ? p.color : "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: selected ? 0.18 : 0.05,
                    shadowRadius: 6,
                    elevation: selected ? 3 : 1,
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

        {/* Main Counter Card */}
        <LinearGradient
          colors={cardGradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.counterCard,
            {
              borderColor: isComplete ? colors.gold : preset.color + "55",
              borderWidth: isComplete ? 2 : 1.5,
              shadowColor: isComplete ? colors.gold : preset.color,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 16,
              elevation: 5,
            },
          ]}
        >
          <Pressable
            onPress={handleTap}
            style={styles.tapZone}
            android_ripple={{ color: preset.color + "44" }}
          >
            {/* Flash overlay */}
            <Animated.View
              pointerEvents="none"
              style={[
                StyleSheet.absoluteFill,
                { backgroundColor: preset.color + "30", borderRadius: 22, opacity: flashAnim },
              ]}
            />

            <Text style={[styles.arabicText, { color: colors.foreground }]}>{preset.arabic}</Text>
            <Text style={[styles.translitText, { color: preset.color }]}>{preset.transliteration}</Text>
            <Text style={[styles.meaningText, { color: colors.mutedForeground }]}>{preset.meaning}</Text>

            <View style={styles.ringRow}>
              <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                <ProgressRing
                  percent={percent}
                  size={isSmall ? 144 : 174}
                  strokeWidth={isSmall ? 11 : 13}
                  label={String(todayCount)}
                  sublabel={`/ ${target}`}
                  color={isComplete ? colors.gold : preset.color}
                  trackColor={isComplete ? colors.goldLight : preset.color + "22"}
                />
              </Animated.View>
            </View>

            <View style={[styles.tapHint, { backgroundColor: preset.color + "18" }]}>
              <Feather name="zap" size={13} color={preset.color} />
              <Text style={[styles.tapHintText, { color: preset.color }]}>{t("tapToCount")}</Text>
            </View>
          </Pressable>
        </LinearGradient>

        {/* Stats Row */}
        <View style={[styles.statsRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
          <View style={[styles.statCard, {
            backgroundColor: colors.card,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.06,
            shadowRadius: 8,
            elevation: 2,
          }]}>
            <Text style={[styles.statVal, { color: colors.foreground }]}>{todayCount}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{t("todayTotal")}</Text>
          </View>
          <View style={[styles.statCard, {
            backgroundColor: colors.card,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.06,
            shadowRadius: 8,
            elevation: 2,
          }]}>
            <Text style={[styles.statVal, { color: colors.foreground }]}>{allTimeCount.toLocaleString()}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{t("allTime")}</Text>
          </View>
          <Pressable
            onPress={handleSetTarget}
            style={[styles.statCard, {
              backgroundColor: colors.card,
              shadowColor: preset.color,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.10,
              shadowRadius: 8,
              elevation: 2,
            }]}
          >
            <Text style={[styles.statVal, { color: preset.color }]}>{target}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{t("target")}</Text>
            <Feather name="edit-2" size={9} color={preset.color} style={{ marginTop: 2 }} />
          </Pressable>
        </View>

        {/* Virtue Card */}
        <View style={[styles.virtueCard, {
          backgroundColor: colors.card,
          borderLeftColor: preset.color,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
          elevation: 2,
        }]}>
          <View style={[styles.virtueHeader, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
            <View style={[styles.virtueDot, { backgroundColor: preset.color }]} />
            <Text style={[styles.virtueLabel, { color: preset.color }]}>{t("virtueLabel")}</Text>
          </View>
          <Text style={[styles.virtueText, { color: colors.foreground, textAlign: isRTL ? "right" : "left" }]}>
            {preset.virtue}
          </Text>
        </View>

        {/* All Dhikr Today */}
        <Text style={[styles.sectionTitle, { color: colors.foreground, textAlign: isRTL ? "right" : "left" }]}>
          {t("allDhikrToday")}
        </Text>
        {TASBIH_PRESETS.map((p) => {
          const c = counts[p.id] ?? 0;
          const tgt = getTarget(p.id);
          const done = c >= tgt;
          const active = p.id === selectedId;
          return (
            <Pressable
              key={p.id}
              onPress={() => setSelectedId(p.id)}
              android_ripple={{ color: p.color + "22" }}
              style={[
                styles.allRow,
                {
                  backgroundColor: active ? p.color + "10" : colors.card,
                  shadowColor: active ? p.color : "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: active ? 0.12 : 0.04,
                  shadowRadius: 6,
                  elevation: active ? 3 : 1,
                },
              ]}
            >
              <View style={[styles.allIconCircle, { backgroundColor: p.color + "1A" }]}>
                <Text style={[styles.allIconText, { color: p.color }]}>{p.arabic[0]}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.allName, { color: active ? p.color : colors.foreground, textAlign: isRTL ? "right" : "left" }]}>
                  {p.transliteration}
                </Text>
                <Text style={[styles.allArabic, { color: colors.mutedForeground, textAlign: isRTL ? "right" : "left" }]}>
                  {p.arabic}
                </Text>
              </View>
              <View style={styles.allRight}>
                <Text style={[styles.allCount, { color: done ? colors.gold : p.color }]}>{c}/{tgt}</Text>
                {done && (
                  <View style={[styles.doneCheck, { backgroundColor: colors.goldLight }]}>
                    <Feather name="check" size={10} color={colors.gold} />
                  </View>
                )}
              </View>
            </Pressable>
          );
        })}

        {/* Reset */}
        <Pressable
          onPress={handleReset}
          style={[styles.resetBtn, { backgroundColor: colors.card }]}
          android_ripple={{ color: colors.muted }}
        >
          <Feather name="rotate-ccw" size={14} color={colors.mutedForeground} />
          <Text style={[styles.resetText, { color: colors.mutedForeground }]}>
            {t("resetCounter")} {preset.transliteration}
          </Text>
        </Pressable>
      </ScrollView>

      {/* Target Input Modal */}
      <Modal
        visible={showTargetInput}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTargetInput(false)}
      >
        <Pressable style={[styles.targetOverlay, { backgroundColor: colors.overlay }]} onPress={() => setShowTargetInput(false)}>
          <Pressable style={[styles.targetSheet, { backgroundColor: colors.card }]} onPress={(e) => e.stopPropagation()}>
            <View style={[styles.targetHandle, { backgroundColor: colors.border }]} />
            <Text style={[styles.targetTitle, { color: colors.foreground }]}>
              {t("setTarget")} · {preset.transliteration}
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
              <Pressable
                style={[styles.targetBtn, { borderColor: colors.border, borderWidth: 1 }]}
                onPress={() => setShowTargetInput(false)}
              >
                <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_500Medium" }}>{t("cancel")}</Text>
              </Pressable>
              <Pressable
                style={[styles.targetBtn, { backgroundColor: preset.color }]}
                onPress={confirmTarget}
              >
                <Text style={{ color: "#FFF", fontFamily: "Inter_700Bold" }}>{t("set")}</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingHorizontal: 16 },
  header: { alignItems: "center", justifyContent: "space-between", marginBottom: 14 },
  pageTitle: { fontSize: 24, fontFamily: "Inter_700Bold" },
  doneBadge: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  doneBadgeText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },

  selectorScroll: { marginBottom: 14, marginHorizontal: -16 },
  selectorContent: { paddingHorizontal: 16, gap: 8 },
  selectorChip: { paddingHorizontal: 16, paddingVertical: 9, borderRadius: 22 },
  chipText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },

  counterCard: { borderRadius: 22, overflow: "hidden", marginBottom: 14 },
  tapZone: { padding: 22, alignItems: "center", gap: 6, minHeight: 300 },
  arabicText: { fontSize: 32, textAlign: "center", lineHeight: 50, fontFamily: "Inter_400Regular" },
  translitText: { fontSize: 16, fontFamily: "Inter_700Bold", textAlign: "center" },
  meaningText: { fontSize: 12, fontFamily: "Inter_400Regular", textAlign: "center" },
  ringRow: { paddingVertical: 10 },
  tapHint: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 22,
  },
  tapHintText: { fontSize: 12, fontFamily: "Inter_500Medium" },

  statsRow: { gap: 8, marginBottom: 14 },
  statCard: { flex: 1, alignItems: "center", paddingVertical: 16, borderRadius: 16, gap: 2 },
  statVal: { fontSize: 22, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 10, fontFamily: "Inter_400Regular" },

  virtueCard: {
    borderRadius: 16, padding: 15, marginBottom: 18,
    borderLeftWidth: 4,
  },
  virtueHeader: { alignItems: "center", gap: 7, marginBottom: 7 },
  virtueDot: { width: 6, height: 6, borderRadius: 3 },
  virtueLabel: { fontSize: 10, fontFamily: "Inter_700Bold", textTransform: "uppercase", letterSpacing: 0.8 },
  virtueText: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 20 },

  sectionTitle: { fontSize: 16, fontFamily: "Inter_700Bold", marginBottom: 10 },
  allRow: {
    flexDirection: "row", alignItems: "center",
    borderRadius: 16, padding: 13, marginBottom: 8, gap: 12,
  },
  allIconCircle: {
    width: 40, height: 40, borderRadius: 12,
    alignItems: "center", justifyContent: "center",
  },
  allIconText: { fontSize: 18, fontFamily: "Inter_400Regular" },
  allName: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  allArabic: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  allRight: { alignItems: "center", gap: 4 },
  allCount: { fontSize: 14, fontFamily: "Inter_700Bold" },
  doneCheck: { width: 20, height: 20, borderRadius: 10, alignItems: "center", justifyContent: "center" },

  resetBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, paddingVertical: 14, borderRadius: 14, marginTop: 6,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  resetText: { fontSize: 13, fontFamily: "Inter_500Medium" },

  targetOverlay: { flex: 1, alignItems: "center", justifyContent: "flex-end" },
  targetHandle: { width: 40, height: 4, borderRadius: 2, alignSelf: "center", marginBottom: 4 },
  targetSheet: {
    width: "100%", padding: 24, paddingBottom: 44,
    borderTopLeftRadius: 24, borderTopRightRadius: 24, gap: 14,
  },
  targetTitle: { fontSize: 16, fontFamily: "Inter_700Bold", textAlign: "center" },
  targetInput: {
    borderWidth: 2, borderRadius: 14, padding: 14,
    fontSize: 30, fontFamily: "Inter_700Bold", textAlign: "center",
  },
  targetBtns: { flexDirection: "row", gap: 12 },
  targetBtn: { flex: 1, padding: 14, borderRadius: 14, alignItems: "center" },
});
