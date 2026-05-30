import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { useLayout } from "@/hooks/useLayout";
import { useTranslation } from "@/hooks/useTranslation";
import type { UserProfile } from "@/utils/calculations";

type Gender = "male" | "female";

const STEPS = ["welcome", "gender", "pubertyAge", "currentAge", "menstruation", "summary"] as const;
type Step = (typeof STEPS)[number];

export default function OnboardingScreen() {
  const colors = useColors();
  const { topPad, insets } = useLayout();
  const { t, isRTL } = useTranslation();
  const { width } = useWindowDimensions();
  const { completeOnboarding } = useApp();

  const [step, setStep] = useState<Step>("welcome");
  const [gender, setGender] = useState<Gender>("male");
  const [pubertyAge, setPubertyAge] = useState("14");
  const [currentAge, setCurrentAge] = useState("");
  const [mensDays, setMensDays] = useState("6");
  const [isLoading, setIsLoading] = useState(false);

  const fadeAnim = useRef(new Animated.Value(1)).current;

  const stepIndex = STEPS.indexOf(step);
  const totalSteps = gender === "male" ? STEPS.length - 1 : STEPS.length;
  const progress = gender === "male"
    ? stepIndex / (STEPS.length - 2)
    : stepIndex / (STEPS.length - 1);

  function animateTransition(nextStep: Step) {
    Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => {
      setStep(nextStep);
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    });
  }

  function goNext() {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (step === "welcome") return animateTransition("gender");
    if (step === "gender") return animateTransition("pubertyAge");
    if (step === "pubertyAge") return animateTransition("currentAge");
    if (step === "currentAge") {
      if (gender === "female") return animateTransition("menstruation");
      return animateTransition("summary");
    }
    if (step === "menstruation") return animateTransition("summary");
    if (step === "summary") handleFinish();
  }

  function goBack() {
    if (step === "welcome") return;
    if (step === "gender") return animateTransition("welcome");
    if (step === "pubertyAge") return animateTransition("gender");
    if (step === "currentAge") return animateTransition("pubertyAge");
    if (step === "menstruation") return animateTransition("currentAge");
    if (step === "summary") return animateTransition(gender === "female" ? "menstruation" : "currentAge");
  }

  async function handleFinish() {
    const profile: UserProfile = {
      gender,
      pubertyAge: parseInt(pubertyAge, 10) || 14,
      currentAge: parseInt(currentAge, 10) || 25,
      mensDaysPerMonth: gender === "female" ? parseInt(mensDays, 10) || 6 : 0,
    };
    setIsLoading(true);
    await completeOnboarding(profile);
    router.replace("/(tabs)" as any);
  }

  function canProceed() {
    if (step === "currentAge") {
      const ca = parseInt(currentAge, 10);
      const pa = parseInt(pubertyAge, 10);
      return ca > pa && ca < 120;
    }
    if (step === "pubertyAge") {
      const pa = parseInt(pubertyAge, 10);
      return pa >= 7 && pa <= 20;
    }
    if (step === "menstruation") {
      const md = parseInt(mensDays, 10);
      return md >= 1 && md <= 15;
    }
    return true;
  }

  const rootPaddingTop = topPad;
  const footerPaddingBottom = insets.bottom + (Platform.OS === "web" ? 34 : 16);

  return (
    <View style={[s.root, { backgroundColor: colors.background, paddingTop: rootPaddingTop }]}>
      {step !== "welcome" && (
        <View style={[s.header, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
          <Pressable onPress={goBack} style={[s.backBtn, { backgroundColor: colors.card }]}>
            <Feather name={isRTL ? "arrow-right" : "arrow-left"} size={20} color={colors.foreground} />
          </Pressable>
          <View style={[s.progressTrack, { backgroundColor: colors.muted }]}>
            <View style={[s.progressFill, { width: `${Math.min(100, progress * 100)}%` as any, backgroundColor: colors.emerald }]} />
          </View>
        </View>
      )}

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={[s.content, { opacity: fadeAnim }]}>

            {step === "welcome" && (
              <View style={s.stepContainer}>
                <View style={[s.iconCircle, { backgroundColor: colors.emeraldLight }]}>
                  <Text style={s.iconEmoji}>🌙</Text>
                </View>
                <Text style={[s.title, { color: colors.foreground, textAlign: isRTL ? "right" : "left" }]}>
                  {t("welcomeTitle")}
                </Text>
                <Text style={[s.subtitle, { color: colors.mutedForeground, textAlign: isRTL ? "right" : "left" }]}>
                  {t("welcomeDesc")}
                </Text>
                <View style={[s.infoCard, { backgroundColor: colors.goldLight, flexDirection: isRTL ? "row-reverse" : "row" }]}>
                  <Feather name="info" size={14} color={colors.gold} style={{ marginTop: 1 }} />
                  <Text style={[s.infoText, { color: colors.gold, textAlign: isRTL ? "right" : "left" }]}>
                    {t("privacyNote")}
                  </Text>
                </View>
              </View>
            )}

            {step === "gender" && (
              <View style={s.stepContainer}>
                <Text style={[s.stepLabel, { color: colors.gold, textAlign: isRTL ? "right" : "left" }]}>{t("step1")}</Text>
                <Text style={[s.title, { color: colors.foreground, textAlign: isRTL ? "right" : "left" }]}>{t("genderTitle")}</Text>
                <Text style={[s.subtitle, { color: colors.mutedForeground, textAlign: isRTL ? "right" : "left" }]}>{t("genderDesc")}</Text>
                <View style={s.optionsRow}>
                  {(["male", "female"] as Gender[]).map((g) => (
                    <Pressable
                      key={g}
                      onPress={() => setGender(g)}
                      style={[
                        s.optionCard,
                        {
                          backgroundColor: gender === g ? colors.emeraldLight : colors.card,
                          borderColor: gender === g ? colors.emerald : colors.border,
                          borderWidth: gender === g ? 2 : 1,
                        },
                      ]}
                    >
                      <Text style={s.optionIcon}>{g === "male" ? "👨" : "👩"}</Text>
                      <Text style={[s.optionLabel, { color: gender === g ? colors.emerald : colors.foreground }]}>
                        {g === "male" ? t("male") : t("female")}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}

            {step === "pubertyAge" && (
              <View style={s.stepContainer}>
                <Text style={[s.stepLabel, { color: colors.gold, textAlign: isRTL ? "right" : "left" }]}>{t("step2")}</Text>
                <Text style={[s.title, { color: colors.foreground, textAlign: isRTL ? "right" : "left" }]}>{t("pubertyTitle")}</Text>
                <Text style={[s.subtitle, { color: colors.mutedForeground, textAlign: isRTL ? "right" : "left" }]}>
                  {t("pubertyDesc")}
                  {"\n"}{t("pubertyHint")} {gender === "female" ? "11–14" : "13–16"} {t("years")}.
                </Text>
                <View style={[s.stepperCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Pressable
                    onPress={() => {
                      const v = Math.max(7, parseInt(pubertyAge, 10) - 1);
                      setPubertyAge(String(v));
                      if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                    style={[s.stepperBtn, { backgroundColor: colors.muted }]}
                  >
                    <Feather name="minus" size={26} color={colors.foreground} />
                  </Pressable>
                  <View style={s.stepperCenter}>
                    <Text style={[s.stepperNum, { color: colors.foreground }]}>{pubertyAge}</Text>
                    <Text style={[s.stepperUnit, { color: colors.mutedForeground }]}>{t("yearsOld")}</Text>
                  </View>
                  <Pressable
                    onPress={() => {
                      const v = Math.min(20, parseInt(pubertyAge, 10) + 1);
                      setPubertyAge(String(v));
                      if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                    style={[s.stepperBtn, { backgroundColor: colors.muted }]}
                  >
                    <Feather name="plus" size={26} color={colors.foreground} />
                  </Pressable>
                </View>
                <Text style={[s.stepperRange, { color: colors.mutedForeground, textAlign: "center" }]}>
                  {t("years")} 7 – 20
                </Text>
              </View>
            )}

            {step === "currentAge" && (
              <View style={s.stepContainer}>
                <Text style={[s.stepLabel, { color: colors.gold, textAlign: isRTL ? "right" : "left" }]}>{t("step3")}</Text>
                <Text style={[s.title, { color: colors.foreground, textAlign: isRTL ? "right" : "left" }]}>{t("currentAgeTitle")}</Text>
                <Text style={[s.subtitle, { color: colors.mutedForeground, textAlign: isRTL ? "right" : "left" }]}>{t("currentAgeDesc")}</Text>
                <View style={[s.inputCard, { backgroundColor: colors.card, borderColor: colors.border, flexDirection: isRTL ? "row-reverse" : "row" }]}>
                  <TextInput
                    style={[s.input, { color: colors.foreground, textAlign: isRTL ? "right" : "left" }]}
                    value={currentAge}
                    onChangeText={setCurrentAge}
                    keyboardType="number-pad"
                    placeholder="30"
                    placeholderTextColor={colors.mutedForeground}
                    maxLength={3}
                    autoFocus
                  />
                  <Text style={[s.inputSuffix, { color: colors.mutedForeground }]}>{t("yearsOld")}</Text>
                </View>
                {currentAge && !canProceed() && (
                  <Text style={[s.errorText, { color: colors.destructive, textAlign: isRTL ? "right" : "left" }]}>
                    {t("currentAgeError")} ({pubertyAge}).
                  </Text>
                )}
              </View>
            )}

            {step === "menstruation" && (
              <View style={s.stepContainer}>
                <Text style={[s.stepLabel, { color: colors.gold, textAlign: isRTL ? "right" : "left" }]}>{t("step4")}</Text>
                <Text style={[s.title, { color: colors.foreground, textAlign: isRTL ? "right" : "left" }]}>{t("mensTitle")}</Text>
                <Text style={[s.subtitle, { color: colors.mutedForeground, textAlign: isRTL ? "right" : "left" }]}>
                  {t("mensDesc")}
                </Text>
                <View style={[s.inputCard, { backgroundColor: colors.card, borderColor: colors.border, flexDirection: isRTL ? "row-reverse" : "row" }]}>
                  <TextInput
                    style={[s.input, { color: colors.foreground, textAlign: isRTL ? "right" : "left" }]}
                    value={mensDays}
                    onChangeText={setMensDays}
                    keyboardType="number-pad"
                    placeholder="6"
                    placeholderTextColor={colors.mutedForeground}
                    maxLength={2}
                    autoFocus
                  />
                  <Text style={[s.inputSuffix, { color: colors.mutedForeground }]}>{t("daysPerMonth")}</Text>
                </View>
                <View style={[s.infoCard, { backgroundColor: colors.emeraldLight, flexDirection: isRTL ? "row-reverse" : "row" }]}>
                  <Feather name="info" size={14} color={colors.emerald} style={{ marginTop: 1 }} />
                  <Text style={[s.infoText, { color: colors.emerald, textAlign: isRTL ? "right" : "left" }]}>
                    {t("mensInfo")}
                  </Text>
                </View>
              </View>
            )}

            {step === "summary" && (
              <View style={s.stepContainer}>
                <Text style={[s.stepLabel, { color: colors.gold, textAlign: isRTL ? "right" : "left" }]}>{t("summaryStep")}</Text>
                <Text style={[s.title, { color: colors.foreground, textAlign: isRTL ? "right" : "left" }]}>
                  {t("summaryTitle")}
                </Text>
                <SummaryCard
                  gender={gender}
                  pubertyAge={parseInt(pubertyAge, 10) || 14}
                  currentAge={parseInt(currentAge, 10) || 25}
                  mensDays={gender === "female" ? parseInt(mensDays, 10) || 6 : 0}
                  colors={colors}
                  isRTL={isRTL}
                  t={t}
                />
                <View style={[s.infoCard, { backgroundColor: colors.goldLight, flexDirection: isRTL ? "row-reverse" : "row" }]}>
                  <Feather name="star" size={14} color={colors.gold} style={{ marginTop: 1 }} />
                  <Text style={[s.infoText, { color: colors.gold, textAlign: isRTL ? "right" : "left" }]}>
                    {t("duaText")}
                  </Text>
                </View>
              </View>
            )}

          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={[s.footer, { backgroundColor: colors.background, paddingBottom: footerPaddingBottom }]}>
        <Pressable
          onPress={goNext}
          disabled={!canProceed() || isLoading}
          style={[
            s.primaryBtn,
            { backgroundColor: canProceed() && !isLoading ? colors.emerald : colors.muted },
          ]}
        >
          <Text style={[s.primaryBtnText, { color: canProceed() && !isLoading ? "#FFFFFF" : colors.mutedForeground }]}>
            {step === "summary" ? t("startTracking") : t("continue")}
          </Text>
          {!isLoading && (
            <Feather
              name={isRTL ? "arrow-left" : "arrow-right"}
              size={18}
              color={canProceed() ? "#FFFFFF" : colors.mutedForeground}
            />
          )}
        </Pressable>
      </View>
    </View>
  );
}

function SummaryCard({
  gender, pubertyAge, currentAge, mensDays, colors, isRTL, t,
}: {
  gender: Gender;
  pubertyAge: number;
  currentAge: number;
  mensDays: number;
  colors: ReturnType<typeof useColors>;
  isRTL: boolean;
  t: (key: any) => string;
}) {
  const lapsedYears = Math.max(0, currentAge - pubertyAge);
  const totalDays = Math.round(lapsedYears * 365.25);
  const mensDaysTotal = gender === "female" ? Math.round(mensDays * 12 * lapsedYears) : 0;
  const effectiveDays = Math.max(0, totalDays - mensDaysTotal);

  const rows: { label: string; value: string; highlight?: boolean }[] = [
    { label: t("yearsOfQaza"), value: `${lapsedYears} ${t("years")}` },
    { label: t("totalDays"), value: totalDays.toLocaleString() },
    ...(gender === "female" ? [{ label: t("mensDaysDeducted"), value: mensDaysTotal.toLocaleString() }] : []),
    { label: t("prayerDaysToMakeUp"), value: effectiveDays.toLocaleString(), highlight: true },
  ];

  return (
    <View style={{ marginTop: 24, gap: 8 }}>
      {rows.map((row) => (
        <View
          key={row.label}
          style={[
            summaryStyles.row,
            { flexDirection: isRTL ? "row-reverse" : "row" },
            {
              backgroundColor: row.highlight ? colors.emeraldLight : colors.card,
              borderColor: row.highlight ? colors.emerald : colors.border,
              borderWidth: row.highlight ? 1.5 : 1,
            },
          ]}
        >
          <Text style={[summaryStyles.rowLabel, { color: colors.mutedForeground, textAlign: isRTL ? "right" : "left" }]}>
            {row.label}
          </Text>
          <Text style={[summaryStyles.rowValue, { color: row.highlight ? colors.emerald : colors.foreground }]}>
            {row.value}
          </Text>
        </View>
      ))}
    </View>
  );
}

const summaryStyles = StyleSheet.create({
  row: {
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
  },
  rowLabel: { fontSize: 14, fontFamily: "Inter_400Regular", flex: 1 },
  rowValue: { fontSize: 15, fontFamily: "Inter_700Bold" },
});

const s = StyleSheet.create({
  root: { flex: 1 },
  header: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 12,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: "center", justifyContent: "center",
  },
  progressTrack: { flex: 1, height: 4, borderRadius: 2, overflow: "hidden" },
  progressFill: { height: 4, borderRadius: 2 },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 120 },
  content: { flex: 1 },
  stepContainer: { paddingTop: 32 },
  stepLabel: {
    fontSize: 12, fontFamily: "Inter_600SemiBold",
    letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 8,
  },
  title: { fontSize: 32, fontFamily: "Inter_700Bold", lineHeight: 40, marginBottom: 12 },
  subtitle: { fontSize: 15, fontFamily: "Inter_400Regular", lineHeight: 22, marginBottom: 28 },
  iconCircle: { width: 80, height: 80, borderRadius: 40, alignItems: "center", justifyContent: "center", marginBottom: 24 },
  iconEmoji: { fontSize: 36 },
  optionsRow: { flexDirection: "row", gap: 12 },
  optionCard: { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 28, borderRadius: 16, gap: 10 },
  optionIcon: { fontSize: 32 },
  optionLabel: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  inputCard: { alignItems: "center", borderRadius: 16, borderWidth: 1.5, paddingHorizontal: 20, paddingVertical: 4 },
  input: { flex: 1, fontSize: 40, fontFamily: "Inter_700Bold", paddingVertical: 16 },
  inputSuffix: { fontSize: 14, fontFamily: "Inter_400Regular" },
  stepperCard: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    borderRadius: 24, borderWidth: 1.5, paddingHorizontal: 10, paddingVertical: 10,
  },
  stepperBtn: {
    width: 68, height: 68, borderRadius: 34,
    alignItems: "center", justifyContent: "center",
  },
  stepperCenter: { flex: 1, alignItems: "center", gap: 2 },
  stepperNum: { fontSize: 60, fontFamily: "Inter_700Bold", lineHeight: 72 },
  stepperUnit: { fontSize: 13, fontFamily: "Inter_400Regular" },
  stepperRange: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 10 },
  infoCard: { borderRadius: 12, padding: 14, gap: 10, marginTop: 16 },
  infoText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 20 },
  errorText: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 8 },
  footer: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    paddingHorizontal: 24, paddingTop: 12,
  },
  primaryBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", height: 54, borderRadius: 16, gap: 8 },
  primaryBtnText: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
});
