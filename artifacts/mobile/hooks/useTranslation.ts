import { useLocale } from "@/context/LocaleContext";

export function useTranslation() {
  const { t, language, isRTL } = useLocale();
  return { t, language, isRTL };
}
