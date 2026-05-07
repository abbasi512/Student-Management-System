import React from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  View,
  type TouchableOpacityProps,
} from "react-native";

type Variant = "primary" | "secondary" | "ghost" | "danger";

type Props = TouchableOpacityProps & {
  variant?: Variant;
  loading?: boolean;
  children: React.ReactNode;
};

const bg: Record<Variant, string> = {
  primary: "bg-sky-600",
  secondary: "bg-white border border-slate-300",
  ghost: "bg-transparent",
  danger: "bg-rose-600",
};

const textColor: Record<Variant, string> = {
  primary: "text-white",
  secondary: "text-slate-700",
  ghost: "text-sky-600",
  danger: "text-white",
};

const disabledBg: Record<Variant, string> = {
  primary: "bg-sky-300",
  secondary: "bg-slate-100 border border-slate-200",
  ghost: "bg-transparent",
  danger: "bg-rose-300",
};

export function Button({
  variant = "primary",
  loading = false,
  disabled,
  children,
  className,
  ...props
}: Props) {
  const isDisabled = disabled || loading;
  const bgClass = isDisabled ? disabledBg[variant] : bg[variant];

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      disabled={isDisabled}
      className={`flex-row items-center justify-center rounded-xl py-3.5 px-6 w-full ${bgClass} ${className ?? ""}`}
      {...props}
    >
      {loading && (
        <View className="mr-2">
          <ActivityIndicator
            size="small"
            color={variant === "secondary" || variant === "ghost" ? "#0284c7" : "#fff"}
          />
        </View>
      )}
      <Text
        className={`text-base font-semibold ${textColor[variant]}`}
      >
        {children}
      </Text>
    </TouchableOpacity>
  );
}
