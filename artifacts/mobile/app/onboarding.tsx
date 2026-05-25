import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import type { UserProfile } from "@/utils/calculations";

const { width } = Dimensions.get("window");

type Gender = "male" | "female";

const STEPS = ["welcome", "gender", "pubertyAge", "currentAge", "menstruation", "summary"] as const;
type Step = (typeof STEPS)[number];

export default function OnboardingScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
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
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
    ]).start(() => {
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
    if (step === "summary") {
      return animateTransition(gender === "female" ? "menstruation" : "currentAge");
    }
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
    router.replace("/(tabs)");
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

  const s = styles(colors);

  return (
    <View style={[s.root, { paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0), paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) }]}>
      {step !== "welcome" && (
        <View style={s.header}>
          <Pressable onPress={goBack} style={s.backBtn}>
            <Feather name="arrow-left" size={20} color={colors.foreground} />
          </Pressable>
          <View style={s.progressTrack}>
            <View style={[s.progressFill, { width: `${Math.min(100, progress * 100)}%` as any }]} />
          </View>
        </View>
      )}

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Animated.View style={[s.content, { opacity: fadeAnim }]}>

            {step === "welcome" && (
              <View style={s.stepContainer}>
                <View style={s.iconCircle}>
                  <Text style={s.iconEmoji}>🌙</Text>
                </View>
                <Text style={s.title}>Qaza Namaz{"\n"}Tracker</Text>
                <Text style={s.subtitle}>
                  Calculate your missed prayers (Qaza-e-Umri) and track your journey to completing them, one prayer at a time.
                </Text>
                <View style={[s.infoCard, { backgroundColor: colors.goldLight }]}>
                  <Feather name="info" size={14} color={colors.gold} style={{ marginTop: 1 }} />
                  <Text style={[s.infoText, { color: colors.gold }]}>
                    All data stays private on your device. We'll ask a few questions to calculate your Qaza count.
                  </Text>
                </View>
              </View>
            )}

            {step === "gender" && (
              <View style={s.stepContainer}>
                <Text style={s.stepLabel}>Step 1</Text>
                <Text style={s.title}>Your Gender</Text>
                <Text style={s.subtitle}>This helps calculate menstruation days for female users.</Text>
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
                        {g === "male" ? "Male" : "Female"}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}

            {step === "pubertyAge" && (
              <View style={s.stepContainer}>
                <Text style={s.stepLabel}>Step 2</Text>
                <Text style={s.title}>Age of Puberty</Text>
                <Text style={s.subtitle}>
                  Approximately when did you reach Bulooghat (puberty)?
                  {"\n"}Common ages: {gender === "female" ? "11–14" : "13–16"} years.
                </Text>
                <View style={[s.inputCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <TextInput
                    style={[s.input, { color: colors.foreground }]}
                    value={pubertyAge}
                    onChangeText={setPubertyAge}
                    keyboardType="number-pad"
                    placeholder={gender === "female" ? "12" : "14"}
                    placeholderTextColor={colors.mutedForeground}
                    maxLength={2}
                  />
                  <Text style={[s.inputSuffix, { color: colors.mutedForeground }]}>years old</Text>
                </View>
              </View>
            )}

            {step === "currentAge" && (
              <View style={s.stepContainer}>
                <Text style={s.stepLabel}>Step 3</Text>
                <Text style={s.title}>Your Current Age</Text>
                <Text style={s.subtitle}>
                  How old are you today?
                </Text>
                <View style={[s.inputCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <TextInput
                    style={[s.input, { color: colors.foreground }]}
                    value={currentAge}
                    onChangeText={setCurrentAge}
                    keyboardType="number-pad"
                    placeholder="30"
                    placeholderTextColor={colors.mutedForeground}
                    maxLength={3}
                    autoFocus
                  />
                  <Text style={[s.inputSuffix, { color: colors.mutedForeground }]}>years old</Text>
                </View>
                {currentAge && !canProceed() && (
                  <Text style={[s.errorText, { color: colors.destructive }]}>
                    Current age must be greater than puberty age ({pubertyAge}).
                  </Text>
                )}
              </View>
            )}

            {step === "menstruation" && (
              <View style={s.stepContainer}>
                <Text style={s.stepLabel}>Step 4</Text>
                <Text style={s.title}>Menstruation Days</Text>
                <Text style={s.subtitle}>
                  How many days per month do you typically experience menstruation (Haiz)?
                  {"\n"}These days will be deducted from your Qaza count.
                </Text>
                <View style={[s.inputCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <TextInput
                    style={[s.input, { color: colors.foreground }]}
                    value={mensDays}
                    onChangeText={setMensDays}
                    keyboardType="number-pad"
                    placeholder="6"
                    placeholderTextColor={colors.mutedForeground}
                    maxLength={2}
                    autoFocus
                  />
                  <Text style={[s.inputSuffix, { color: colors.mutedForeground }]}>days / month</Text>
                </View>
                <View style={[s.infoCard, { backgroundColor: colors.emeraldLight }]}>
                  <Feather name="info" size={14} color={colors.emerald} style={{ marginTop: 1 }} />
                  <Text style={[s.infoText, { color: colors.emerald }]}>
                    During menstruation, Salah is not obligatory. These days are excluded from your Qaza calculation.
                  </Text>
                </View>
              </View>
            )}

            {step === "summary" && (
              <View style={s.stepContainer}>
                <Text style={s.stepLabel}>Summary</Text>
                <Text style={s.title}>Your Qaza{"\n"}Calculation</Text>
                <SummaryCard
                  gender={gender}
                  pubertyAge={parseInt(pubertyAge, 10) || 14}
                  currentAge={parseInt(currentAge, 10) || 25}
                  mensDays={gender === "female" ? parseInt(mensDays, 10) || 6 : 0}
                  colors={colors}
                />
                <View style={[s.infoCard, { backgroundColor: colors.goldLight }]}>
                  <Feather name="star" size={14} color={colors.gold} style={{ marginTop: 1 }} />
                  <Text style={[s.infoText, { color: colors.gold }]}>
                    May Allah make it easy for you to complete your Qaza prayers. Take it one prayer at a time.
                  </Text>
                </View>
              </View>
            )}

          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={[s.footer, { paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 16) }]}>
        <Pressable
          onPress={goNext}
          disabled={!canProceed() || isLoading}
          style={[
            s.primaryBtn,
            {
              backgroundColor: canProceed() && !isLoading ? colors.emerald : colors.muted,
            },
          ]}
        >
          <Text style={[s.primaryBtnText, { color: canProceed() && !isLoading ? "#FFFFFF" : colors.mutedForeground }]}>
            {step === "summary" ? "Start Tracking" : "Continue"}
          </Text>
          {!isLoading && <Feather name="arrow-right" size={18} color={canProceed() ? "#FFFFFF" : colors.mutedForeground} />}
        </Pressable>
      </View>
    </View>
  );
}

function SummaryCard({ gender, pubertyAge, currentAge, mensDays, colors }: {
  gender: Gender;
  pubertyAge: number;
  currentAge: number;
  mensDays: number;
  colors: ReturnType<typeof useColors>;
}) {
  const lapsedYears = Math.max(0, currentAge - pubertyAge);
  const totalDays = Math.round(lapsedYears * 365.25);
  const mensDaysTotal = gender === "female" ? Math.round(mensDays * 12 * lapsedYears) : 0;
  const effectiveDays = Math.max(0, totalDays - mensDaysTotal);

  const rows = [
    { label: "Years of Qaza", value: `${lapsedYears} years` },
    { label: "Total Days", value: totalDays.toLocaleString() },
    ...(gender === "female" ? [{ label: "Menstruation Days Deducted", value: mensDaysTotal.toLocaleString() }] : []),
    { label: "Prayer Days to Make Up", value: effectiveDays.toLocaleString(), highlight: true },
  ];

  return (
    <View style={{ marginTop: 24, gap: 8 }}>
      {rows.map((row) => (
        <View
          key={row.label}
          style={[
            summaryStyles.row,
            {
              backgroundColor: row.highlight ? colors.emeraldLight : colors.card,
              borderColor: row.highlight ? colors.emerald : colors.border,
              borderWidth: row.highlight ? 1.5 : 1,
            },
          ]}
        >
          <Text style={[summaryStyles.rowLabel, { color: colors.mutedForeground }]}>{row.label}</Text>
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
  },
  rowLabel: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    flex: 1,
  },
  rowValue: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
  },
});

const styles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 8,
      gap: 12,
    },
    backBtn: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: colors.card,
      alignItems: "center",
      justifyContent: "center",
    },
    progressTrack: {
      flex: 1,
      height: 4,
      backgroundColor: colors.muted,
      borderRadius: 2,
      overflow: "hidden",
    },
    progressFill: {
      height: 4,
      backgroundColor: colors.emerald,
      borderRadius: 2,
    },
    scroll: {
      flexGrow: 1,
      paddingHorizontal: 24,
      paddingBottom: 120,
    },
    content: {
      flex: 1,
    },
    stepContainer: {
      paddingTop: 32,
    },
    stepLabel: {
      fontSize: 12,
      fontFamily: "Inter_600SemiBold",
      color: colors.gold,
      letterSpacing: 1.2,
      textTransform: "uppercase",
      marginBottom: 8,
    },
    title: {
      fontSize: 32,
      fontFamily: "Inter_700Bold",
      color: colors.foreground,
      lineHeight: 40,
      marginBottom: 12,
    },
    subtitle: {
      fontSize: 15,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      lineHeight: 22,
      marginBottom: 28,
    },
    iconCircle: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.emeraldLight,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 24,
    },
    iconEmoji: {
      fontSize: 36,
    },
    optionsRow: {
      flexDirection: "row",
      gap: 12,
    },
    optionCard: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 28,
      borderRadius: 16,
      gap: 10,
    },
    optionIcon: {
      fontSize: 32,
    },
    optionLabel: {
      fontSize: 16,
      fontFamily: "Inter_600SemiBold",
    },
    inputCard: {
      flexDirection: "row",
      alignItems: "center",
      borderRadius: 16,
      borderWidth: 1.5,
      paddingHorizontal: 20,
      paddingVertical: 4,
    },
    input: {
      flex: 1,
      fontSize: 40,
      fontFamily: "Inter_700Bold",
      paddingVertical: 16,
    },
    inputSuffix: {
      fontSize: 14,
      fontFamily: "Inter_400Regular",
    },
    infoCard: {
      flexDirection: "row",
      borderRadius: 12,
      padding: 14,
      gap: 10,
      marginTop: 16,
    },
    infoText: {
      flex: 1,
      fontSize: 13,
      fontFamily: "Inter_400Regular",
      lineHeight: 20,
    },
    errorText: {
      fontSize: 13,
      fontFamily: "Inter_400Regular",
      marginTop: 8,
    },
    footer: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      paddingHorizontal: 24,
      paddingTop: 12,
      backgroundColor: colors.background,
    },
    primaryBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      height: 54,
      borderRadius: 16,
      gap: 8,
    },
    primaryBtnText: {
      fontSize: 16,
      fontFamily: "Inter_600SemiBold",
    },
  });
