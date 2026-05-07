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

const schema = z.object({ email: z.string().email("Enter a valid email") });
type Form = z.infer<typeof schema>;

export default function ForgotPassword() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (data: Form) => {
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", data);
      setSent(true);
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.message ?? "Something went wrong.");
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
                <Ionicons name="lock-closed-outline" size={30} color="#fff" />
              </View>
              <Text className="text-white text-2xl font-bold">Forgot Password</Text>
              <Text className="text-sky-100 text-sm mt-1 text-center">We'll send a reset link</Text>
            </View>
          </LinearGradient>

          <View className="flex-1 -mt-6 mx-4 bg-white rounded-3xl shadow-lg px-6 pt-8 pb-6">
            {sent ? (
              <View className="items-center py-8">
                <View className="bg-emerald-100 w-16 h-16 rounded-full items-center justify-center mb-4">
                  <Ionicons name="checkmark-circle" size={40} color="#059669" />
                </View>
                <Text className="text-slate-900 text-xl font-bold mb-2">Email Sent!</Text>
                <Text className="text-slate-500 text-sm text-center mb-6">
                  Check your inbox for a password reset link.
                </Text>
                <Button onPress={() => router.replace("/(auth)/signin")}>Back to Sign In</Button>
              </View>
            ) : (
              <>
                <Text className="text-slate-900 text-2xl font-bold mb-1">Reset Password</Text>
                <Text className="text-slate-500 text-sm mb-6">
                  Enter your email and we'll send you a reset link.
                </Text>
                <Controller
                  control={control}
                  name="email"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input label="Email" placeholder="you@example.com" keyboardType="email-address" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.email?.message} />
                  )}
                />
                <Button loading={loading} onPress={handleSubmit(onSubmit)} className="mt-2">
                  Send Reset Link
                </Button>
                <Button variant="ghost" onPress={() => router.back()} className="mt-3">
                  Back to Sign In
                </Button>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
