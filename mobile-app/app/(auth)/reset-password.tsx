import React, { useState } from "react";
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { api } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const schema = z.object({
  token: z.string().min(1, "Token is required"),
  password: z.string().min(6, "At least 6 characters"),
  confirm: z.string().min(6, "At least 6 characters"),
}).refine((d) => d.password === d.confirm, {
  message: "Passwords don't match",
  path: ["confirm"],
});
type Form = z.infer<typeof schema>;

export default function ResetPassword() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { token: "", password: "", confirm: "" },
  });

  const onSubmit = async (data: Form) => {
    setLoading(true);
    try {
      await api.post("/auth/reset-password", { token: data.token, password: data.password });
      Alert.alert("Success", "Password reset! Please sign in.", [
        { text: "OK", onPress: () => router.replace("/(auth)/signin") },
      ]);
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.message ?? "Invalid or expired token.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={["top"]}>
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <LinearGradient
            colors={["#0ea5e9", "#4f46e5"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ paddingHorizontal: 24, paddingTop: 40, paddingBottom: 56 }}
          >
            <View className="items-center">
              <View className="bg-white/20 w-16 h-16 rounded-2xl items-center justify-center mb-4">
                <Ionicons name="key-outline" size={30} color="#fff" />
              </View>
              <Text className="text-white text-2xl font-bold">New Password</Text>
            </View>
          </LinearGradient>

          <View className="flex-1 -mt-6 mx-4 bg-white rounded-3xl shadow-lg px-6 pt-8 pb-6">
            <Text className="text-slate-900 text-2xl font-bold mb-1">Reset Password</Text>
            <Text className="text-slate-500 text-sm mb-6">Enter the token from your email.</Text>

            <Controller control={control} name="token"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input label="Reset Token" placeholder="Paste token from email" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.token?.message} />
              )}
            />
            <Controller control={control} name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input label="New Password" placeholder="Min. 6 characters" secureTextEntry secureToggle value={value} onChangeText={onChange} onBlur={onBlur} error={errors.password?.message} />
              )}
            />
            <Controller control={control} name="confirm"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input label="Confirm Password" placeholder="Repeat password" secureTextEntry secureToggle value={value} onChangeText={onChange} onBlur={onBlur} error={errors.confirm?.message} />
              )}
            />

            <Button loading={loading} onPress={handleSubmit(onSubmit)} className="mt-2">
              Reset Password
            </Button>
            <Button variant="ghost" onPress={() => router.replace("/(auth)/signin")} className="mt-3">
              Back to Sign In
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
