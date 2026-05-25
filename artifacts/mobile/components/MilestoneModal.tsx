import * as Haptics from "expo-haptics";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useColors } from "@/hooks/useColors";
import { useTranslation } from "@/hooks/useTranslation";
import type { Milestone } from "@/utils/milestones";

interface MilestoneModalProps {
  milestone: Milestone | null;
  onDismiss: () => void;
}

export function MilestoneModal({ milestone, onDismiss }: MilestoneModalProps) {
  const colors = useColors();
  const { t, isRTL } = useTranslation();
  const scaleAnim = useRef(new Animated.Value(0.7)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (milestone) {
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, tension: 60, friction: 8, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
      ]).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, { toValue: -8, duration: 600, useNativeDriver: true }),
          Animated.timing(bounceAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
        ])
      ).start();
    } else {
      scaleAnim.setValue(0.7);
      opacityAnim.setValue(0);
      bounceAnim.setValue(0);
    }
  }, [milestone]);

  if (!milestone) return null;

  return (
    <Modal transparent visible={!!milestone} animationType="none" onRequestClose={onDismiss}>
      <Pressable style={[styles.overlay, { backgroundColor: colors.overlay }]} onPress={onDismiss}>
        <Animated.View
          style={[
            styles.card,
            {
              backgroundColor: colors.card,
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim,
            },
          ]}
        >
          <Animated.Text style={[styles.emoji, { transform: [{ translateY: bounceAnim }] }]}>
            {milestone.emoji}
          </Animated.Text>

          <View style={[styles.badge, { backgroundColor: colors.goldLight }]}>
            <Text style={[styles.badgeText, { color: colors.gold }]}>
              {milestone.value.toLocaleString()} {t("prayers")}
            </Text>
          </View>

          <Text style={[styles.title, { color: colors.foreground, textAlign: isRTL ? "right" : "center" }]}>
            {milestone.title}
          </Text>
          <Text style={[styles.message, { color: colors.mutedForeground, textAlign: isRTL ? "right" : "center" }]}>
            {milestone.message}
          </Text>

          <Pressable
            onPress={onDismiss}
            style={[styles.btn, { backgroundColor: colors.emerald }]}
          >
            <Text style={styles.btnText}>{t("alhamdulillah")}</Text>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32 },
  card: {
    width: "100%", maxWidth: 340, borderRadius: 24, padding: 28,
    alignItems: "center", gap: 12,
    shadowColor: "#000", shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2, shadowRadius: 24, elevation: 16,
  },
  emoji: { fontSize: 64, marginBottom: 4 },
  badge: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20 },
  badgeText: { fontSize: 13, fontFamily: "Inter_700Bold", letterSpacing: 0.5 },
  title: { fontSize: 24, fontFamily: "Inter_700Bold" },
  message: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 22, paddingHorizontal: 8 },
  btn: {
    marginTop: 8, paddingHorizontal: 32, paddingVertical: 14,
    borderRadius: 16, width: "100%", alignItems: "center",
  },
  btnText: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#FFFFFF" },
});
