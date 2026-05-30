import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { useColors } from "@/hooks/useColors";

interface ProgressRingProps {
  percent: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
  color?: string;
  trackColor?: string;
  textColor?: string;
  sublabelColor?: string;
}

export function ProgressRing({
  percent,
  size = 120,
  strokeWidth = 10,
  label,
  sublabel,
  color,
  trackColor,
  textColor,
  sublabelColor,
}: ProgressRingProps) {
  const colors = useColors();
  const ringColor = color ?? colors.gold;
  const ringTrack = trackColor ?? colors.muted;
  const labelColor = textColor ?? colors.foreground;
  const subColor = sublabelColor ?? (textColor ? textColor + "BB" : colors.mutedForeground);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(100, percent) / 100) * circumference;
  const center = size / 2;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <Circle
          cx={center} cy={center} r={radius}
          stroke={ringTrack} strokeWidth={strokeWidth} fill="none"
        />
        <Circle
          cx={center} cy={center} r={radius}
          stroke={ringColor} strokeWidth={strokeWidth} fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${center}, ${center}`}
        />
      </Svg>
      <View style={styles.labelContainer}>
        {label !== undefined && (
          <Text style={[styles.label, { color: labelColor }]}>{label}</Text>
        )}
        {sublabel !== undefined && (
          <Text style={[styles.sublabel, { color: subColor }]}>{sublabel}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", justifyContent: "center" },
  labelContainer: { position: "absolute", alignItems: "center", justifyContent: "center" },
  label: { fontSize: 22, fontFamily: "Inter_700Bold", textAlign: "center" },
  sublabel: { fontSize: 11, fontFamily: "Inter_400Regular", textAlign: "center", marginTop: 2 },
});
