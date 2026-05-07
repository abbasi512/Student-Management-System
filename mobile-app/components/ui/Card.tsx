import React from "react";
import { View, type ViewProps } from "react-native";

type Props = ViewProps & { children: React.ReactNode; className?: string };

export function Card({ children, className, ...props }: Props) {
  return (
    <View
      className={`bg-white rounded-2xl border border-slate-200 shadow-sm p-4 ${className ?? ""}`}
      {...props}
    >
      {children}
    </View>
  );
}
