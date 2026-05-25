import { Redirect } from "expo-router";
import { View } from "react-native";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

export default function Index() {
  const { isLoaded, onboardingDone } = useApp();
  const colors = useColors();

  if (!isLoaded) {
    return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  }

  if (!onboardingDone) {
    return <Redirect href="/onboarding" />;
  }

  return <Redirect href="/(tabs)/tracker" />;
}
