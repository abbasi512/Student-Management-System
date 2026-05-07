import React from "react";
import { View, Text, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { getInitials } from "@/lib/utils";

type NamedSize = "sm" | "md" | "lg" | "xl";

const sizeMap: Record<NamedSize, number> = {
  sm: 32, md: 40, lg: 64, xl: 96,
};

type Props = { name?: string | null; uri?: string | null; imageUrl?: string | null; size?: NamedSize | number };

export function Avatar({ name, uri, imageUrl, size = "md" }: Props) {
  const box = typeof size === "number" ? size : sizeMap[size];
  const font = Math.round(box * 0.35);
  const radius = box / 2;
  const imgUri = uri ?? imageUrl ?? null;

  if (imgUri) {
    return (
      <Image
        source={{ uri: imgUri }}
        style={{ width: box, height: box, borderRadius: radius }}
      />
    );
  }

  return (
    // NOTE: LinearGradient must use the `style` prop — never `className`
    <LinearGradient
      colors={["#0ea5e9", "#4f46e5"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ width: box, height: box, borderRadius: radius, alignItems: "center", justifyContent: "center" }}
    >
      <Text style={{ color: "#fff", fontSize: font, fontWeight: "bold" }}>
        {getInitials(name)}
      </Text>
    </LinearGradient>
  );
}
