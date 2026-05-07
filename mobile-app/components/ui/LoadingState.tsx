import React from "react";
import { View, ActivityIndicator, Text } from "react-native";

type Props = { label?: string; message?: string; fullScreen?: boolean };

export function LoadingState({ label, message, fullScreen = true }: Props) {
  const text = label ?? message;
  return (
    <View style={{ flex: fullScreen ? 1 : undefined, alignItems: "center", justifyContent: "center", paddingVertical: fullScreen ? 0 : 64 }}>
      <ActivityIndicator size="large" color="#0284c7" />
      {text ? (
        <Text style={{ marginTop: 12, fontSize: 14, color: "#64748b" }}>{text}</Text>
      ) : null}
    </View>
  );
}
