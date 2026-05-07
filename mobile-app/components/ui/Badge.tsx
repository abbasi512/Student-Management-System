import React from "react";
import { View, Text } from "react-native";

type Color = "sky" | "green" | "amber" | "red" | "purple" | "slate";

const colorMap: Record<Color, { bg: string; text: string }> = {
  sky:    { bg: "#e0f2fe", text: "#0369a1" },
  green:  { bg: "#d1fae5", text: "#065f46" },
  amber:  { bg: "#fef3c7", text: "#92400e" },
  red:    { bg: "#fee2e2", text: "#991b1b" },
  purple: { bg: "#ede9fe", text: "#5b21b6" },
  slate:  { bg: "#f1f5f9", text: "#475569" },
};

type Props = {
  label: string;
  color?: Color;
};

export function Badge({ label, color = "slate" }: Props) {
  const { bg, text } = colorMap[color];
  return (
    <View style={{ alignSelf: "flex-start", borderRadius: 100, paddingHorizontal: 10, paddingVertical: 3, backgroundColor: bg }}>
      <Text style={{ fontSize: 11, fontWeight: "600", color: text }}>{label}</Text>
    </View>
  );
}
