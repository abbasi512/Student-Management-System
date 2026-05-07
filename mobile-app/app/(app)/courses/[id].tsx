import React, { useEffect, useState, useCallback } from "react";
import {
  View, Text, ScrollView, RefreshControl,
  TouchableOpacity, Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import { LoadingState } from "@/components/ui/LoadingState";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import type { Course, Assignment } from "@/lib/types";

interface CourseDetail extends Course {
  enrollments?: { id: string; student: { id: string; name: string; email: string } }[];
  assignments?: Assignment[];
  isEnrolled?: boolean;
}

export default function CourseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthStore();
  const router = useRouter();
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const isStaff = user?.role === "TEACHER" || user?.role === "ADMIN";

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const { data } = await api.get<CourseDetail>(`/courses/${id}`);
      setCourse(data);
    } catch {
      Alert.alert("Error", "Failed to load course details.");
      router.back();
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const onRefresh = () => { setRefreshing(true); load(); };

  const handleEnroll = async () => {
    if (!course) return;
    setEnrolling(true);
    try {
      if (course.isEnrolled) {
        await api.delete(`/courses/${course.id}/enroll`);
        setCourse((prev) => prev ? { ...prev, isEnrolled: false } : prev);
      } else {
        await api.post(`/courses/${course.id}/enroll`);
        setCourse((prev) => prev ? { ...prev, isEnrolled: true } : prev);
      }
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.message ?? "Action failed.");
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) return <LoadingState message="Loading course..." />;
  if (!course) return null;

  const colors = ["#0ea5e9", "#8b5cf6", "#10b981", "#f59e0b", "#ec4899"];
  const color = colors[course.name.charCodeAt(0) % colors.length];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f8fafc" }} edges={["bottom"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <LinearGradient
          colors={[color, color + "cc"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ paddingHorizontal: 20, paddingTop: 24, paddingBottom: 48 }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center", marginRight: 12 }}
            >
              <Ionicons name="arrow-back" size={20} color="#fff" />
            </TouchableOpacity>
            <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>Course Detail</Text>
          </View>
          <Text style={{ color: "#fff", fontSize: 24, fontWeight: "800" }}>{course.name}</Text>
          <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 14, marginTop: 4 }}>{course.code}</Text>
        </LinearGradient>

        <View style={{ marginTop: -20, marginHorizontal: 16 }}>
          {/* Info Card */}
          <View style={{ backgroundColor: "#fff", borderRadius: 20, padding: 18, marginBottom: 14, shadowColor: "#000", shadowOpacity: 0.06, shadowOffset: { width: 0, height: 2 }, shadowRadius: 8, elevation: 3 }}>
            {course.description && (
              <>
                <Text style={{ fontSize: 14, fontWeight: "600", color: "#0f172a", marginBottom: 6 }}>About</Text>
                <Text style={{ fontSize: 14, color: "#64748b", lineHeight: 21, marginBottom: 14 }}>{course.description}</Text>
              </>
            )}

            <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
              <Badge label={`${course._count?.enrollments ?? 0} enrolled`} color="sky" />
              {course.teacher && (
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Avatar name={course.teacher.name} size={24} />
                  <Text style={{ fontSize: 13, color: "#475569", marginLeft: 6 }}>{course.teacher.name}</Text>
                </View>
              )}
            </View>

            {!isStaff && (
              <TouchableOpacity
                onPress={handleEnroll}
                disabled={enrolling}
                style={{ marginTop: 16, borderRadius: 14, paddingVertical: 13, alignItems: "center", backgroundColor: course.isEnrolled ? "#fef2f2" : color }}
              >
                <Text style={{ fontSize: 15, fontWeight: "700", color: course.isEnrolled ? "#ef4444" : "#fff" }}>
                  {enrolling ? "Please wait..." : course.isEnrolled ? "Unenroll" : "Enroll Now"}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Assignments */}
          {(course.assignments?.length ?? 0) > 0 && (
            <View style={{ backgroundColor: "#fff", borderRadius: 20, padding: 18, marginBottom: 14, shadowColor: "#000", shadowOpacity: 0.06, shadowOffset: { width: 0, height: 2 }, shadowRadius: 8, elevation: 3 }}>
              <Text style={{ fontSize: 15, fontWeight: "700", color: "#0f172a", marginBottom: 12 }}>
                Assignments ({course.assignments!.length})
              </Text>
              {course.assignments!.map((a) => (
                <View key={a.id} style={{ flexDirection: "row", alignItems: "flex-start", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#f1f5f9" }}>
                  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color, marginTop: 6, marginRight: 10 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: "600", color: "#0f172a" }}>{a.title}</Text>
                    {a.dueDate && (
                      <Text style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
                        Due: {new Date(a.dueDate).toLocaleDateString()}
                      </Text>
                    )}
                  </View>
                  <Badge
                    label={a.submission?.grade != null ? `${a.submission.grade}` : a.submission?.score != null ? `${a.submission.score}` : "Pending"}
                    color={(a.submission?.grade != null || a.submission?.score != null) ? "green" : "amber"}
                  />
                </View>
              ))}
            </View>
          )}

          {/* Students (staff only) */}
          {isStaff && (course.enrollments?.length ?? 0) > 0 && (
            <View style={{ backgroundColor: "#fff", borderRadius: 20, padding: 18, marginBottom: 24, shadowColor: "#000", shadowOpacity: 0.06, shadowOffset: { width: 0, height: 2 }, shadowRadius: 8, elevation: 3 }}>
              <Text style={{ fontSize: 15, fontWeight: "700", color: "#0f172a", marginBottom: 12 }}>
                Students ({course.enrollments!.length})
              </Text>
              {course.enrollments!.map((e) => (
                <View key={e.id} style={{ flexDirection: "row", alignItems: "center", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#f1f5f9" }}>
                  <Avatar name={e.student.name} size={36} />
                  <View style={{ marginLeft: 10 }}>
                    <Text style={{ fontSize: 14, fontWeight: "600", color: "#0f172a" }}>{e.student.name}</Text>
                    <Text style={{ fontSize: 12, color: "#94a3b8" }}>{e.student.email}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
