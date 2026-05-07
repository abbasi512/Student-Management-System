import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  icon: keyof typeof Ionicons.glyphMap;
  value: string | number;
  label: string;
  iconBg?: string;
  iconColor?: string;
};

export function StatCard({
  icon,
  value,
  label,
  iconBg = "bg-sky-100",
  iconColor = "#0284c7",
}: Props) {
  return (
    <View className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex-1 m-1.5">
      <View className={`w-10 h-10 rounded-xl items-center justify-center mb-3 ${iconBg}`}>
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>
      <Text className="text-2xl font-bold text-slate-900">{value}</Text>
      <Text className="text-xs text-slate-500 mt-0.5 font-medium">{label}</Text>
    </View>
  );
}
