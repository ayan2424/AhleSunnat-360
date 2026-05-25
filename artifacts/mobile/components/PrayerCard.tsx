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
  const countFlash = useRef(new Animated.Value(1)).current;
  const prevRemaining = useRef(remaining);

  const completed = initialCount - remaining;
  const percent = initialCount > 0 ? (completed / initialCount) * 100 : 100;
  const isComplete = remaining === 0;
  const progressWidth = Math.min(100, percent);

  useEffect(() => {
    if (prevRemaining.current !== remaining) {
      Animated.sequence([
        Animated.timing(countFlash, { toValue: 1.25, duration: 100, useNativeDriver: true }),
        Animated.spring(countFlash, { toValue: 1, friction: 4, useNativeDriver: true }),
      ]).start();
      prevRemaining.current = remaining;
    }
  }, [remaining]);

  function animatePress(scale: Animated.Value, callback: () => void) {
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.82, duration: 70, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, friction: 5, tension: 80, useNativeDriver: true }),
    ]).start();
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
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
          shadowColor: prayer.color,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isComplete ? 0 : 0.06,
          shadowRadius: 8,
          elevation: isComplete ? 0 : 2,
        },
      ]}
    >
      <View style={styles.body}>
        <View style={styles.leftSection}>
          <View style={[styles.prayerIconBg, { backgroundColor: prayer.color + "22" }]}>
            <View style={[styles.prayerDot, { backgroundColor: prayer.color }]} />
          </View>
          <View>
            <Text style={[styles.prayerName, { color: colors.foreground }]}>
              {prayer.name}
            </Text>
            <Text style={[styles.arabicRow, { color: colors.mutedForeground }]}>
              <Text style={styles.arabicName}>{prayer.arabicName}</Text>
              {"  ·  "}
              <Text>{prayer.rakaat} {prayer.type}</Text>
              {"  ·  "}
              <Text>{prayer.timeLabel}</Text>
            </Text>
          </View>
        </View>

        <View style={styles.rightSection}>
          {isComplete ? (
            <View style={[styles.completedBadge, { backgroundColor: colors.goldLight }]}>
              <Feather name="check-circle" size={13} color={colors.gold} />
              <Text style={[styles.completedText, { color: colors.gold }]}>Complete</Text>
            </View>
          ) : (
            <View style={styles.controls}>
              <Animated.View style={{ transform: [{ scale: scaleIncrement }] }}>
                <Pressable
                  onPress={() => animatePress(scaleIncrement, onIncrement)}
                  style={[styles.adjBtn, { backgroundColor: colors.muted }]}
                  hitSlop={10}
                >
                  <Feather name="minus" size={15} color={colors.mutedForeground} />
                </Pressable>
              </Animated.View>

              <Animated.Text
                style={[
                  styles.count,
                  { color: colors.foreground, transform: [{ scale: countFlash }] },
                ]}
              >
                {remaining.toLocaleString()}
              </Animated.Text>

              <Animated.View style={{ transform: [{ scale: scaleDecrement }] }}>
                <Pressable
                  onPress={() => animatePress(scaleDecrement, onDecrement)}
                  style={[styles.logBtn, { backgroundColor: prayer.color }]}
                  hitSlop={10}
                >
                  <Feather name="check" size={16} color="#FFFFFF" />
                </Pressable>
              </Animated.View>
            </View>
          )}
        </View>
      </View>

      <View style={[styles.progressTrack, { backgroundColor: colors.muted }]}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${progressWidth}%` as any,
              backgroundColor: isComplete ? colors.gold : prayer.color,
            },
          ]}
        />
      </View>

      {!isComplete && (
        <Text style={[styles.progressLabel, { color: colors.mutedForeground }]}>
          {Math.round(percent)}% done · {completed.toLocaleString()} completed
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
    marginBottom: 10,
    overflow: "hidden",
  },
  body: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  prayerIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  prayerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  prayerName: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    lineHeight: 20,
  },
  arabicRow: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  arabicName: {
    fontSize: 12,
  },
  rightSection: {
    alignItems: "flex-end",
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  adjBtn: {
    width: 30,
    height: 30,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  logBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  count: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    minWidth: 52,
    textAlign: "center",
  },
  completedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  completedText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: 4,
    borderRadius: 2,
  },
  progressLabel: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    marginTop: 5,
    textAlign: "right",
  },
});
