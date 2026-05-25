import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useRef } from "react";
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useColors } from "@/hooks/useColors";
import type { PrayerInfo } from "@/utils/calculations";

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
  const scaleDecrement = useRef(new Animated.Value(1)).current;
  const scaleIncrement = useRef(new Animated.Value(1)).current;

  const completed = initialCount - remaining;
  const percent = initialCount > 0 ? (completed / initialCount) * 100 : 100;
  const isComplete = remaining === 0;

  function animatePress(scale: Animated.Value, callback: () => void) {
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.85, duration: 80, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start();
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    callback();
  }

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: isComplete ? colors.gold : colors.border,
          borderWidth: isComplete ? 1.5 : 1,
        },
      ]}
    >
      <View style={styles.leftSection}>
        <View
          style={[
            styles.colorDot,
            { backgroundColor: prayer.color },
          ]}
        />
        <View>
          <Text style={[styles.prayerName, { color: colors.foreground }]}>
            {prayer.name}
          </Text>
          <Text style={[styles.arabicName, { color: colors.mutedForeground }]}>
            {prayer.arabicName} · {prayer.rakaat} {prayer.type}
          </Text>
        </View>
      </View>

      <View style={styles.rightSection}>
        {isComplete ? (
          <View style={[styles.completedBadge, { backgroundColor: colors.goldLight }]}>
            <Feather name="check-circle" size={14} color={colors.gold} />
            <Text style={[styles.completedText, { color: colors.gold }]}>Done</Text>
          </View>
        ) : (
          <>
            <Animated.View style={{ transform: [{ scale: scaleIncrement }] }}>
              <Pressable
                onPress={() => animatePress(scaleIncrement, onIncrement)}
                style={[styles.adjBtn, { backgroundColor: colors.secondary }]}
                hitSlop={8}
              >
                <Feather name="minus" size={16} color={colors.mutedForeground} />
              </Pressable>
            </Animated.View>

            <Text style={[styles.count, { color: colors.foreground }]}>
              {remaining.toLocaleString()}
            </Text>

            <Animated.View style={{ transform: [{ scale: scaleDecrement }] }}>
              <Pressable
                onPress={() => animatePress(scaleDecrement, onDecrement)}
                style={[styles.adjBtn, { backgroundColor: colors.emeraldLight }]}
                hitSlop={8}
              >
                <Feather name="plus" size={16} color={colors.emerald} />
              </Pressable>
            </Animated.View>
          </>
        )}
      </View>

      {!isComplete && (
        <View style={[styles.progressBar, { backgroundColor: colors.muted }]}>
          <View
            style={[
              styles.progressFill,
              { width: `${percent}%` as any, backgroundColor: prayer.color },
            ]}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 18,
    marginBottom: 10,
    overflow: "hidden",
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 4,
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  prayerName: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    lineHeight: 20,
  },
  arabicName: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 1,
  },
  rightSection: {
    position: "absolute",
    right: 16,
    top: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  adjBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  count: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    minWidth: 56,
    textAlign: "center",
  },
  completedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  completedText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  progressBar: {
    height: 3,
    borderRadius: 2,
    marginTop: 10,
    overflow: "hidden",
  },
  progressFill: {
    height: 3,
    borderRadius: 2,
  },
});
