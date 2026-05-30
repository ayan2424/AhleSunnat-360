import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useColors } from "@/hooks/useColors";
import { useTranslation } from "@/hooks/useTranslation";
import type { PrayerInfo } from "@/utils/calculations";
import type { TranslationKey } from "@/utils/translations";

const PRAYER_ICONS: Record<string, React.ComponentProps<typeof Feather>["name"]> = {
  fajar:   "sunrise",
  zohar:   "sun",
  asar:    "cloud",
  maghrib: "sunset",
  isha:    "moon",
  witr:    "star",
};

interface PrayerCardProps {
  prayer: PrayerInfo;
  remaining: number;
  initialCount: number;
  onDecrement: () => void;
  onIncrement: () => void;
}

export function PrayerCard({
  prayer,
  remaining,
  initialCount,
  onDecrement,
  onIncrement,
}: PrayerCardProps) {
  const colors = useColors();
  const { t, isRTL } = useTranslation();
  const scaleDecrement = useRef(new Animated.Value(1)).current;
  const scaleIncrement = useRef(new Animated.Value(1)).current;
  const countFlash = useRef(new Animated.Value(1)).current;
  const prevRemaining = useRef(remaining);

  const completed = initialCount - remaining;
  const percent = initialCount > 0 ? (completed / initialCount) * 100 : 100;
  const isComplete = remaining === 0;
  const progressWidth = Math.min(100, percent);

  const prayerNameKey = prayer.key as TranslationKey;
  const timeLabelKeyMap: Record<string, TranslationKey> = {
    fajar: "dawn", zohar: "noon", asar: "afternoon",
    maghrib: "sunset", isha: "night", witr: "night",
  };
  const timeLabelKey = timeLabelKeyMap[prayer.key];
  const typeKey = prayer.type === "Farz" ? "farz" : "wajib";
  const prayerIcon = PRAYER_ICONS[prayer.key] ?? "star";

  useEffect(() => {
    if (prevRemaining.current !== remaining) {
      Animated.sequence([
        Animated.timing(countFlash, { toValue: 1.3, duration: 100, useNativeDriver: true }),
        Animated.spring(countFlash, { toValue: 1, friction: 4, useNativeDriver: true }),
      ]).start();
      prevRemaining.current = remaining;
    }
  }, [remaining]);

  function animatePress(scale: Animated.Value, callback: () => void) {
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.80, duration: 65, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, friction: 4, tension: 80, useNativeDriver: true }),
    ]).start();
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    callback();
  }

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: isComplete ? colors.goldLight + "88" : colors.card,
          shadowColor: isComplete ? colors.gold : "#000000",
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: isComplete ? 0.15 : 0.07,
          shadowRadius: 10,
          elevation: 4,
        },
      ]}
    >
      {/* Completion accent bar */}
      {isComplete && (
        <View style={[styles.accentBar, { backgroundColor: colors.gold }]} />
      )}

      <View style={[styles.body, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
        {/* Left: icon + info */}
        <View style={[styles.leftSection, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
          <View
            style={[
              styles.iconCircle,
              { backgroundColor: isComplete ? colors.goldLight : prayer.color + "1A" },
            ]}
          >
            <Feather
              name={prayerIcon}
              size={18}
              color={isComplete ? colors.gold : prayer.color}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={[
                styles.prayerName,
                { color: isComplete ? colors.gold : colors.foreground, textAlign: isRTL ? "right" : "left" },
              ]}
            >
              {t(prayerNameKey)}
            </Text>
            <Text
              style={[styles.prayerMeta, { color: colors.mutedForeground, textAlign: isRTL ? "right" : "left" }]}
              numberOfLines={1}
            >
              {prayer.arabicName}{"  ·  "}{prayer.rakaat} {t(typeKey as TranslationKey)}
              {"  ·  "}{timeLabelKey ? t(timeLabelKey) : prayer.timeLabel}
            </Text>
          </View>
        </View>

        {/* Right: controls */}
        <View style={styles.rightSection}>
          {isComplete ? (
            <View style={[styles.completedBadge, { backgroundColor: colors.gold + "22" }]}>
              <Feather name="check-circle" size={14} color={colors.gold} />
              <Text style={[styles.completedText, { color: colors.gold }]}>{t("complete")}</Text>
            </View>
          ) : (
            <View style={[styles.controls, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
              <Animated.View style={{ transform: [{ scale: scaleIncrement }] }}>
                <Pressable
                  onPress={() => animatePress(scaleIncrement, onIncrement)}
                  style={[styles.undoBtn, { backgroundColor: colors.muted }]}
                  hitSlop={12}
                >
                  <Feather name="minus" size={15} color={colors.mutedForeground} />
                </Pressable>
              </Animated.View>

              <Animated.Text
                style={[styles.count, { color: colors.foreground, transform: [{ scale: countFlash }] }]}
              >
                {remaining.toLocaleString()}
              </Animated.Text>

              <Animated.View style={{ transform: [{ scale: scaleDecrement }] }}>
                <Pressable
                  onPress={() => animatePress(scaleDecrement, onDecrement)}
                  style={[styles.logBtn, { backgroundColor: prayer.color }]}
                  hitSlop={8}
                  android_ripple={{ color: "rgba(255,255,255,0.3)" }}
                >
                  <Feather name="check" size={19} color="#FFF" />
                </Pressable>
              </Animated.View>
            </View>
          )}
        </View>
      </View>

      {/* Progress bar */}
      {!isComplete && (
        <View style={[styles.progressTrack, { backgroundColor: colors.muted }]}>
          <View
            style={[
              styles.progressFill,
              { width: `${progressWidth}%` as any, backgroundColor: prayer.color },
            ]}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 11,
    marginBottom: 9,
    overflow: "hidden",
  },
  accentBar: { position: "absolute", left: 0, top: 0, bottom: 0, width: 4 },
  body: { alignItems: "center", justifyContent: "space-between", marginBottom: 11, gap: 8 },
  leftSection: { alignItems: "center", gap: 12, flex: 1, minWidth: 0 },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  prayerName: { fontSize: 15, fontFamily: "Inter_700Bold", lineHeight: 20 },
  prayerMeta: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 3, lineHeight: 16 },
  rightSection: { alignItems: "flex-end", flexShrink: 0 },
  controls: { alignItems: "center", gap: 8 },
  undoBtn: {
    width: 33,
    height: 33,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  logBtn: {
    width: 44,
    height: 44,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  count: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    minWidth: 52,
    textAlign: "center",
  },
  completedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 22,
  },
  completedText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  progressTrack: { height: 5, borderRadius: 3, overflow: "hidden" },
  progressFill: { height: 5, borderRadius: 3 },
});
