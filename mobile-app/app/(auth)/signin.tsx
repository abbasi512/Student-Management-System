import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "At least 6 characters"),
});
type Form = z.infer<typeof schema>;

export default function SignIn() {
  const { login } = useAuthStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: Form) => {
    setLoading(true);
    try {
      await login(data);
      router.replace("/(app)");
    } catch (e: any) {
      Alert.alert("Sign In Failed", e?.response?.data?.message ?? "Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={["top"]}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {/* Header — LinearGradient uses style, never className */}
          <LinearGradient
            colors={["#0ea5e9", "#4f46e5"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ paddingHorizontal: 24, paddingTop: 40, paddingBottom: 56 }}
          >
            <View className="items-center">
              <View className="bg-white/20 w-16 h-16 rounded-2xl items-center justify-center mb-4">
                <Ionicons name="school" size={34} color="#fff" />
              </View>
              <Text className="text-white text-3xl font-bold">EduManage</Text>
              <Text className="text-sky-100 text-sm mt-1">Student Management System</Text>
            </View>
          </LinearGradient>

          {/* Form card */}
          <View className="flex-1 -mt-6 mx-4 bg-white rounded-3xl shadow-lg px-6 pt-8 pb-6">
            <Text className="text-slate-900 text-2xl font-bold mb-1">Welcome back</Text>
            <Text className="text-slate-500 text-sm mb-6">Sign in to your account</Text>

            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Email"
                  placeholder="you@example.com"
                  keyboardType="email-address"
                  autoComplete="email"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.email?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Password"
                  placeholder="Your password"
                  secureTextEntry
                  secureToggle
                  autoComplete="password"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.password?.message}
                />
              )}
            />

            <TouchableOpacity className="self-end -mt-2 mb-5" onPress={() => router.push("/(auth)/forgot-password")}>
              <Text className="text-sky-600 text-sm font-medium">Forgot password?</Text>
            </TouchableOpacity>

            <Button loading={loading} onPress={handleSubmit(onSubmit)}>
              Sign In
            </Button>

            <View className="flex-row items-center justify-center mt-6">
              <Text className="text-slate-500 text-sm">Don't have an account? </Text>
              <TouchableOpacity onPress={() => router.replace("/(auth)/signup")}>
                <Text className="text-sky-600 text-sm font-semibold">Sign up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
