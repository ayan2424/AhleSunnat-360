import { Platform, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const TAB_BAR_WEB = 84;
const TAB_BAR_IOS = 49;
const TAB_BAR_ANDROID = 56;
const TOP_EXTRA_WEB = 67;
const FAB_HEIGHT = 68;

export function useLayout() {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const isSmall = width < 375;
  const isTablet = width >= 768;

  const tabBarHeight =
    Platform.OS === "web"
      ? TAB_BAR_WEB
      : Platform.OS === "ios"
        ? TAB_BAR_IOS + insets.bottom
        : TAB_BAR_ANDROID;

  const topPad = insets.top + (Platform.OS === "web" ? TOP_EXTRA_WEB : 0);

  const scrollBottom = tabBarHeight + 24;
  const scrollBottomFab = tabBarHeight + FAB_HEIGHT + 20;
  const fabBottom = tabBarHeight;

  return {
    width,
    height,
    isSmall,
    isTablet,
    topPad,
    scrollBottom,
    scrollBottomFab,
    fabBottom,
    tabBarHeight,
    insets,
  };
}
