import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, type TextInputProps } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = TextInputProps & {
  label?: string;
  error?: string;
  secureToggle?: boolean;
};

export function Input({ label, error, secureToggle, secureTextEntry, ...props }: Props) {
  const [secure, setSecure] = useState(secureTextEntry ?? false);
  const [focused, setFocused] = useState(false);

  const borderColor = error
    ? "border-rose-400"
    : focused
    ? "border-sky-500"
    : "border-slate-200";

  return (
    <View className="mb-4">
      {label ? (
        <Text className="text-sm font-semibold text-slate-700 mb-1.5">{label}</Text>
      ) : null}
      <View className={`flex-row items-center bg-white rounded-xl border px-4 ${borderColor}`}>
        <TextInput
          className="flex-1 py-3.5 text-slate-900 text-base"
          placeholderTextColor="#94a3b8"
          secureTextEntry={secure}
          autoCapitalize="none"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />
        {secureToggle ? (
          <TouchableOpacity onPress={() => setSecure((v) => !v)} className="ml-2 p-1">
            <Ionicons
              name={secure ? "eye-off-outline" : "eye-outline"}
              size={20}
              color="#94a3b8"
            />
          </TouchableOpacity>
        ) : null}
      </View>
      {error ? (
        <Text className="text-rose-500 text-xs mt-1.5">{error}</Text>
      ) : null}
    </View>
  );
}
