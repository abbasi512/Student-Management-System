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
import type { Role } from "@/lib/types";

const schema = z.object({
  name: z.string().min(2, "Name is too short"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "At least 6 characters"),
  role: z.enum(["STUDENT", "TEACHER"]),
});
type Form = z.infer<typeof schema>;

const roles: { value: "STUDENT" | "TEACHER"; label: string; icon: string }[] = [
  { value: "STUDENT", label: "Student", icon: "school-outline" },
  { value: "TEACHER", label: "Teacher", icon: "person-outline" },
];

export default function SignUp() {
  const { signup } = useAuthStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", password: "", role: "STUDENT" },
  });

  const selectedRole = watch("role");

  const onSubmit = async (data: Form) => {
    setLoading(true);
    try {
      await signup(data);
      router.replace("/(app)");
    } catch (e: any) {
      Alert.alert("Sign Up Failed", e?.response?.data?.message ?? "Please try again.");
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
          {/* Header */}
          <LinearGradient
            colors={["#0ea5e9", "#4f46e5"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ paddingHorizontal: 24, paddingTop: 40, paddingBottom: 56 }}
          >
            <View className="items-center">
              <View className="bg-white/20 w-16 h-16 rounded-2xl items-center justify-center mb-4">
                <Ionicons name="person-add" size={30} color="#fff" />
              </View>
              <Text className="text-white text-2xl font-bold">Create Account</Text>
              <Text className="text-sky-100 text-sm mt-1">Join EduManage today</Text>
            </View>
          </LinearGradient>

          {/* Form */}
          <View className="flex-1 -mt-6 mx-4 bg-white rounded-3xl shadow-lg px-6 pt-8 pb-6">
            <Text className="text-slate-900 text-2xl font-bold mb-1">Get started</Text>
            <Text className="text-slate-500 text-sm mb-6">Fill in your details below</Text>

            {/* Role selector */}
            <Text className="text-sm font-semibold text-slate-700 mb-2">I am a</Text>
            <View className="flex-row gap-3 mb-4">
              {roles.map((r) => (
                <TouchableOpacity
                  key={r.value}
                  onPress={() => setValue("role", r.value)}
                  className={`flex-1 flex-row items-center justify-center py-3 rounded-xl border ${
                    selectedRole === r.value
                      ? "bg-sky-50 border-sky-500"
                      : "bg-white border-slate-200"
                  }`}
                >
                  <Ionicons
                    name={r.icon as any}
                    size={18}
                    color={selectedRole === r.value ? "#0284c7" : "#94a3b8"}
                  />
                  <Text
                    className={`ml-2 text-sm font-semibold ${
                      selectedRole === r.value ? "text-sky-700" : "text-slate-500"
                    }`}
                  >
                    {r.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input label="Full Name" placeholder="John Doe" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.name?.message} autoComplete="name" />
              )}
            />
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input label="Email" placeholder="you@example.com" keyboardType="email-address" autoComplete="email" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.email?.message} />
              )}
            />
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input label="Password" placeholder="Min. 6 characters" secureTextEntry secureToggle value={value} onChangeText={onChange} onBlur={onBlur} error={errors.password?.message} />
              )}
            />

            <Button loading={loading} onPress={handleSubmit(onSubmit)} className="mt-2">
              Create Account
            </Button>

            <View className="flex-row items-center justify-center mt-5">
              <Text className="text-slate-500 text-sm">Already have an account? </Text>
              <TouchableOpacity onPress={() => router.replace("/(auth)/signin")}>
                <Text className="text-sky-600 text-sm font-semibold">Sign in</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
