import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { useColors } from "@/hooks/useColors";
import { useTranslation } from "@/hooks/useTranslation";
import { HADITHS, type Hadith } from "@/utils/hadiths";

const AUTO_SLIDE_MS = 7000;

export function HadithCarousel() {
  const colors = useColors();
  const { isRTL } = useTranslation();
  const { width } = useWindowDimensions();

  const [index, setIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const hadith: Hadith = HADITHS[index];
  const total = HADITHS.length;

  function goTo(next: number, manual = false) {
    if (manual && timerRef.current) {
      clearInterval(timerRef.current);
      startTimer();
    }
    Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
      setIndex(next);
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    });
  }

  function startTimer() {
    timerRef.current = setInterval(() => {
      setIndex((prev) => {
        const next = (prev + 1) % total;
        Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
          Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
        });
        return next;
      });
    }, AUTO_SLIDE_MS);
  }

  useEffect(() => {
    startTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  return (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      {/* Gold top bar */}
      <View style={[styles.topBar, { backgroundColor: colors.gold }]} />

      {/* Header row */}
      <View style={[styles.headerRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
        <View style={[styles.headerLeft, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
          <View style={[styles.goldDot, { backgroundColor: colors.gold }]} />
          <Text style={[styles.headerLabel, { color: colors.gold }]}>HADITH</Text>
        </View>
        <Text style={[styles.counter, { color: colors.mutedForeground }]}>
          {index + 1} / {total}
        </Text>
      </View>

      {/* Animated content */}
      <Animated.View style={{ opacity: fadeAnim }}>
        {/* Arabic */}
        {hadith.arabic && (
          <Text style={[styles.arabic, { color: colors.foreground }]}>
            {hadith.arabic}
          </Text>
        )}

        {/* English text */}
        <Text style={[styles.text, { color: colors.foreground, textAlign: isRTL ? "right" : "left" }]}>
          "{hadith.text}"
        </Text>

        {/* Source chip */}
        <View style={[styles.sourceRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
          <View style={[styles.sourcePill, { backgroundColor: colors.goldLight }]}>
            <Text style={[styles.sourceText, { color: colors.gold }]}>📖 {hadith.source}</Text>
          </View>
        </View>
      </Animated.View>

      {/* Dot indicators + nav */}
      <View style={[styles.footer, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
        {/* Prev */}
        <Pressable
          onPress={() => goTo((index - 1 + total) % total, true)}
          style={[styles.navBtn, { backgroundColor: colors.muted }]}
          hitSlop={10}
        >
          <Text style={[styles.navArrow, { color: colors.mutedForeground }]}>
            {isRTL ? "›" : "‹"}
          </Text>
        </Pressable>

        {/* Dots */}
        <View style={styles.dots}>
          {HADITHS.map((_, i) => (
            <Pressable key={i} onPress={() => goTo(i, true)} hitSlop={6}>
              <View
                style={[
                  styles.dot,
                  {
                    backgroundColor: i === index ? colors.gold : colors.border,
                    width: i === index ? 18 : 6,
                  },
                ]}
              />
            </Pressable>
          ))}
        </View>

        {/* Next */}
        <Pressable
          onPress={() => goTo((index + 1) % total, true)}
          style={[styles.navBtn, { backgroundColor: colors.muted }]}
          hitSlop={10}
        >
          <Text style={[styles.navArrow, { color: colors.mutedForeground }]}>
            {isRTL ? "‹" : "›"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  topBar: { height: 4, width: "100%" },
  headerRow: {
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
  },
  headerLeft: { alignItems: "center", gap: 8 },
  goldDot: { width: 7, height: 7, borderRadius: 4 },
  headerLabel: {
    fontSize: 10,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1.2,
  },
  counter: { fontSize: 11, fontFamily: "Inter_400Regular" },
  arabic: {
    fontSize: 20,
    lineHeight: 36,
    textAlign: "center",
    fontFamily: "Inter_400Regular",
    paddingHorizontal: 18,
    paddingBottom: 8,
    color: "#1A2E1F",
  },
  text: {
    fontSize: 13.5,
    fontFamily: "Inter_400Regular",
    lineHeight: 21,
    fontStyle: "italic",
    paddingHorizontal: 18,
    paddingBottom: 12,
  },
  sourceRow: { paddingHorizontal: 18, paddingBottom: 14 },
  sourcePill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  sourceText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  footer: {
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.06)",
  },
  dots: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    flex: 1,
    justifyContent: "center",
  },
  dot: { height: 6, borderRadius: 3 },
  navBtn: {
    width: 30,
    height: 30,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  navArrow: { fontSize: 18, fontFamily: "Inter_700Bold", lineHeight: 22 },
});
