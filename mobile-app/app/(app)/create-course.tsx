import React, { useEffect, useState, useCallback } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  Alert, KeyboardAvoidingView, Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { LoadingState } from "@/components/ui/LoadingState";
import type { User, Course } from "@/lib/types";

const schema = z.object({
  code: z.string().min(2, "At least 2 characters"),
  title: z.string().min(3, "At least 3 characters"),
  description: z.string().min(5, "At least 5 characters"),
  credits: z.number({ invalid_type_error: "Enter a number" }).min(1).max(10),
  capacity: z.number({ invalid_type_error: "Enter a number" }).min(1),
  teacherId: z.string().optional(),
});
type Form = z.infer<typeof schema>;

export default function CreateCourseScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { user } = useAuthStore();
  const router = useRouter();
  const isAdmin = user?.role === "ADMIN";
  const isEdit = !!id;

  const [teachers, setTeachers] = useState<User[]>([]);
  const [loadingInitial, setLoadingInitial] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { code: "", title: "", description: "", credits: 3, capacity: 30, teacherId: "" },
  });

  const loadTeachers = useCallback(async () => {
    if (!isAdmin) return;
    try {
      const { data } = await api.get<User[]>("/users");
      setTeachers(Array.isArray(data) ? data.filter((u) => u.role === "TEACHER") : []);
    } catch {
      setTeachers([]);
    }
  }, [isAdmin]);

  const loadCourse = useCallback(async () => {
    if (!id) return;
    try {
      const { data } = await api.get<Course>(`/courses/${id}`);
      reset({
        code: data.code ?? "",
        title: data.title ?? "",
        description: data.description ?? "",
        credits: data.credits ?? 3,
        capacity: data.capacity ?? 30,
        teacherId: data.teacher?.id ?? "",
      });
    } catch {
      Alert.alert("Error", "Failed to load course.");
      router.back();
    } finally {
      setLoadingInitial(false);
    }
  }, [id]);

  useEffect(() => {
    loadTeachers();
    if (isEdit) loadCourse();
  }, [loadTeachers, loadCourse, isEdit]);

  const onSubmit = async (data: Form) => {
    setSaving(true);
    try {
      const payload = {
        code: data.code,
        title: data.title,
        description: data.description,
        credits: data.credits,
        capacity: data.capacity,
        ...(data.teacherId ? { teacherId: data.teacherId } : {}),
      };

      if (isEdit) {
        await api.put(`/courses/${id}`, payload);
        Alert.alert("Updated", "Course updated successfully.", [
          { text: "OK", onPress: () => router.back() },
        ]);
      } else {
        await api.post("/courses", payload);
        Alert.alert("Created", "Course created successfully.", [
          { text: "OK", onPress: () => router.back() },
        ]);
      }
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.message ?? "Failed to save course.");
    } finally {
      setSaving(false);
    }
  };

  if (loadingInitial) return <LoadingState message="Loading course..." />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f8fafc" }} edges={["bottom"]}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        {/* Header */}
        <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#f1f5f9" }}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
            <Ionicons name="arrow-back" size={22} color="#0f172a" />
          </TouchableOpacity>
          <Text style={{ fontSize: 17, fontWeight: "700", color: "#0f172a" }}>
            {isEdit ? "Edit Course" : "Create Course"}
          </Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16 }}>
          <View style={{ backgroundColor: "#fff", borderRadius: 20, padding: 20, shadowColor: "#000", shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 }, shadowRadius: 8, elevation: 3 }}>
            <Controller control={control} name="code"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input label="Course Code" placeholder="e.g. CS101" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.code?.message} autoCapitalize="characters" />
              )}
            />
            <Controller control={control} name="title"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input label="Course Title" placeholder="Introduction to Computer Science" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.title?.message} />
              )}
            />
            <Controller control={control} name="description"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input label="Description" placeholder="What will students learn?" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.description?.message} multiline numberOfLines={3} />
              )}
            />

            <View style={{ flexDirection: "row", gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Controller control={control} name="credits"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input label="Credits" placeholder="3" keyboardType="number-pad" value={String(value ?? "")} onChangeText={(v) => onChange(Number(v) || 0)} onBlur={onBlur} error={errors.credits?.message} />
                  )}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Controller control={control} name="capacity"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input label="Capacity" placeholder="30" keyboardType="number-pad" value={String(value ?? "")} onChangeText={(v) => onChange(Number(v) || 0)} onBlur={onBlur} error={errors.capacity?.message} />
                  )}
                />
              </View>
            </View>

            {/* Teacher Picker (Admin only) */}
            {isAdmin && teachers.length > 0 && (
              <View style={{ marginBottom: 14 }}>
                <Text style={{ fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 8 }}>Assign Teacher</Text>
                <Controller control={control} name="teacherId"
                  render={({ field: { value, onChange } }) => (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -4 }}>
                      {[{ id: "", name: "Unassigned" }, ...teachers].map((t) => (
                        <TouchableOpacity
                          key={t.id}
                          onPress={() => onChange(t.id)}
                          style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, marginHorizontal: 4, backgroundColor: value === t.id ? "#0ea5e9" : "#f8fafc", borderWidth: 1.5, borderColor: value === t.id ? "#0ea5e9" : "#e2e8f0" }}
                        >
                          <Text style={{ fontSize: 13, fontWeight: "600", color: value === t.id ? "#fff" : "#475569" }}>{t.name}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  )}
                />
              </View>
            )}

            <Button loading={saving} onPress={handleSubmit(onSubmit)} className="mt-2">
              {isEdit ? "Save Changes" : "Create Course"}
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
