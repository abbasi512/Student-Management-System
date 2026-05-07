import React, { useEffect, useState, useCallback } from "react";
import { View, Text, ScrollView, RefreshControl, TouchableOpacity, TextInput } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import { LoadingState } from "@/components/ui/LoadingState";
import { Badge } from "@/components/ui/Badge";
import type { Course } from "@/lib/types";

const PALETTE = ["#0ea5e9", "#8b5cf6", "#10b981", "#f59e0b", "#ec4899", "#ef4444"];
const courseColor = (title?: string | null) =>
  PALETTE[title ? title.charCodeAt(0) % PALETTE.length : 0];

export default function CoursesScreen() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [filtered, setFiltered] = useState<Course[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const isStaff = user?.role === "TEACHER" || user?.role === "ADMIN";

  const load = useCallback(async () => {
    try {
      const { data } = await api.get<Course[]>("/courses");
      const safe = Array.isArray(data) ? data : [];
      setCourses(safe);
      setFiltered(safe);
    } catch {
      setCourses([]); setFiltered([]);
    } finally {
      setLoading(false); setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  const onRefresh = () => { setRefreshing(true); load(); };

  useEffect(() => {
    const q = query.toLowerCase();
    setFiltered(courses.filter((c) =>
      (c.title ?? "").toLowerCase().includes(q) || (c.code ?? "").toLowerCase().includes(q)
    ));
  }, [query, courses]);

  if (loading) return <LoadingState message="Loading courses..." />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f8fafc" }} edges={["bottom"]}>
      <View style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 }}>
        <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: "#e2e8f0" }}>
          <Ionicons name="search-outline" size={18} color="#94a3b8" />
          <TextInput
            style={{ flex: 1, marginLeft: 8, fontSize: 14, color: "#0f172a" }}
            placeholder="Search courses..."
            placeholderTextColor="#94a3b8"
            value={query}
            onChangeText={setQuery}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery("")}>
              <Ionicons name="close-circle" size={18} color="#94a3b8" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{ padding: 16, paddingTop: 8 }}
      >
        {isStaff && (
          <TouchableOpacity
            onPress={() => router.push("/(app)/create-course" as any)}
            style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", padding: 14, borderRadius: 16, backgroundColor: "#eff6ff", borderWidth: 1.5, borderColor: "#bfdbfe", marginBottom: 16 }}
          >
            <Ionicons name="add-circle-outline" size={20} color="#0ea5e9" />
            <Text style={{ marginLeft: 8, fontSize: 14, fontWeight: "600", color: "#0ea5e9" }}>Create New Course</Text>
          </TouchableOpacity>
        )}
        {filtered.length === 0 ? (
          <View style={{ alignItems: "center", paddingVertical: 60 }}>
            <Ionicons name="book-outline" size={48} color="#cbd5e1" />
            <Text style={{ color: "#94a3b8", fontSize: 15, marginTop: 12 }}>
              {query ? "No courses match your search" : "No courses yet"}
            </Text>
          </View>
        ) : (
          filtered.map((course) => (
            <CourseCard key={course.id} course={course} onPress={() => router.push(`/(app)/courses/${course.id}` as any)} />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function CourseCard({ course, onPress }: { course: Course; onPress: () => void }) {
  const color = courseColor(course.title);
  return (
    <TouchableOpacity onPress={onPress} style={{ backgroundColor: "#fff", borderRadius: 18, marginBottom: 12, shadowColor: "#000", shadowOpacity: 0.06, shadowOffset: { width: 0, height: 2 }, shadowRadius: 8, elevation: 3, overflow: "hidden" }}>
      <View style={{ height: 6, backgroundColor: color }} />
      <View style={{ padding: 16 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
          <View style={{ flex: 1, marginRight: 12 }}>
            <Text style={{ fontSize: 16, fontWeight: "700", color: "#0f172a", marginBottom: 2 }}>{course.title ?? "Untitled"}</Text>
            <Text style={{ fontSize: 13, color: "#64748b", marginBottom: 8 }}>{course.code ?? ""}</Text>
            {!!course.description && (
              <Text style={{ fontSize: 13, color: "#94a3b8" }} numberOfLines={2}>{String(course.description)}</Text>
            )}
          </View>
          <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: color + "33", alignItems: "center", justifyContent: "center" }}>
            <Ionicons name="book-outline" size={22} color={color} />
          </View>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 10, flexWrap: "wrap", gap: 8 }}>
          {course.teacher && (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons name="person-outline" size={13} color="#94a3b8" />
              <Text style={{ fontSize: 12, color: "#94a3b8", marginLeft: 4 }}>{course.teacher.name}</Text>
            </View>
          )}
          <Badge label={`${course._count?.enrollments ?? 0} students`} color="sky" />
        </View>
      </View>
    </TouchableOpacity>
  );
}
