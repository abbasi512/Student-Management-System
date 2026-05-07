import React, { useEffect, useState, useCallback } from "react";
import {
  View, Text, ScrollView, RefreshControl,
  TouchableOpacity, Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { api } from "@/lib/api";
import { LoadingState } from "@/components/ui/LoadingState";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import type { Course } from "@/lib/types";

type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE";

interface AttendanceRecord {
  id: string;
  studentId: string;
  student: { id: string; name: string; email: string };
  courseId: string;
  date: string;
  status: AttendanceStatus;
}

interface StudentRow {
  id: string;
  name: string;
  email: string;
  status: AttendanceStatus | null;
  recordId?: string;
}

export default function AttendanceScreen() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [date] = useState(() => new Date().toISOString().split("T")[0]);

  const loadCourses = useCallback(async () => {
    try {
      const { data } = await api.get<Course[]>("/courses");
      setCourses(data);
      if (data.length > 0 && !selectedCourse) setSelectedCourse(data[0]);
    } catch {
      // ignore
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const loadStudents = useCallback(async (course: Course) => {
    setLoadingStudents(true);
    try {
      const [enrollRes, attRes] = await Promise.all([
        api.get<{ student: { id: string; name: string; email: string } }[]>(`/courses/${course.id}/enrollments`),
        api.get<AttendanceRecord[]>(`/attendance?courseId=${course.id}&date=${date}`),
      ]);
      const records = attRes.data;
      const rows: StudentRow[] = enrollRes.data.map((e) => {
        const rec = records.find((r) => r.studentId === e.student.id);
        return { ...e.student, status: rec?.status ?? null, recordId: rec?.id };
      });
      setStudents(rows);
    } catch {
      // ignore
    } finally {
      setLoadingStudents(false);
    }
  }, [date]);

  useEffect(() => { loadCourses(); }, [loadCourses]);

  useEffect(() => {
    if (selectedCourse) loadStudents(selectedCourse);
  }, [selectedCourse, loadStudents]);

  const onRefresh = () => { setRefreshing(true); loadCourses(); };

  const setStatus = (studentId: string, status: AttendanceStatus) => {
    setStudents((prev) => prev.map((s) => s.id === studentId ? { ...s, status } : s));
  };

  const handleSave = async () => {
    if (!selectedCourse) return;
    setSaving(true);
    try {
      const records = students.filter((s) => s.status !== null).map((s) => ({
        studentId: s.id,
        courseId: selectedCourse.id,
        date,
        status: s.status!,
      }));
      await api.post("/attendance/bulk", { records });
      Alert.alert("Saved", "Attendance has been recorded.");
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.message ?? "Failed to save attendance.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState message="Loading attendance..." />;

  const statusConfig: { key: AttendanceStatus; label: string; color: string; bg: string }[] = [
    { key: "PRESENT", label: "P", color: "#059669", bg: "#d1fae5" },
    { key: "LATE", label: "L", color: "#d97706", bg: "#fef3c7" },
    { key: "ABSENT", label: "A", color: "#dc2626", bg: "#fee2e2" },
  ];

  const stats = {
    present: students.filter((s) => s.status === "PRESENT").length,
    late: students.filter((s) => s.status === "LATE").length,
    absent: students.filter((s) => s.status === "ABSENT").length,
    unmarked: students.filter((s) => !s.status).length,
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f8fafc" }} edges={["bottom"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Course Picker */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12, gap: 8 }}>
          {courses.map((c) => (
            <TouchableOpacity
              key={c.id}
              onPress={() => setSelectedCourse(c)}
              style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: selectedCourse?.id === c.id ? "#0ea5e9" : "#fff", borderWidth: 1, borderColor: selectedCourse?.id === c.id ? "#0ea5e9" : "#e2e8f0" }}
            >
              <Text style={{ fontSize: 13, fontWeight: "600", color: selectedCourse?.id === c.id ? "#fff" : "#475569" }}>{c.code}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {selectedCourse && (
          <View style={{ paddingHorizontal: 16 }}>
            {/* Header info */}
            <View style={{ backgroundColor: "#fff", borderRadius: 18, padding: 16, marginBottom: 14, shadowColor: "#000", shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 }, shadowRadius: 8, elevation: 3 }}>
              <Text style={{ fontSize: 16, fontWeight: "700", color: "#0f172a" }}>{selectedCourse.name}</Text>
              <Text style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>
                {new Date(date).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
              </Text>
              <View style={{ flexDirection: "row", gap: 8, marginTop: 12 }}>
                {[
                  { label: "Present", value: stats.present, color: "#059669" },
                  { label: "Late", value: stats.late, color: "#d97706" },
                  { label: "Absent", value: stats.absent, color: "#dc2626" },
                  { label: "Unmarked", value: stats.unmarked, color: "#94a3b8" },
                ].map((s) => (
                  <View key={s.label} style={{ flex: 1, alignItems: "center" }}>
                    <Text style={{ fontSize: 20, fontWeight: "700", color: s.color }}>{s.value}</Text>
                    <Text style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>{s.label}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Mark all buttons */}
            <View style={{ flexDirection: "row", gap: 8, marginBottom: 12 }}>
              {statusConfig.map((s) => (
                <TouchableOpacity
                  key={s.key}
                  onPress={() => setStudents((prev) => prev.map((st) => ({ ...st, status: s.key })))}
                  style={{ flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: "center", backgroundColor: s.bg }}
                >
                  <Text style={{ fontSize: 12, fontWeight: "700", color: s.color }}>All {s.key === "PRESENT" ? "Present" : s.key === "LATE" ? "Late" : "Absent"}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Student List */}
            {loadingStudents ? (
              <LoadingState message="Loading students..." />
            ) : students.length === 0 ? (
              <View style={{ alignItems: "center", paddingVertical: 40 }}>
                <Ionicons name="people-outline" size={40} color="#cbd5e1" />
                <Text style={{ color: "#94a3b8", marginTop: 8 }}>No students enrolled</Text>
              </View>
            ) : (
              <View style={{ backgroundColor: "#fff", borderRadius: 18, overflow: "hidden", shadowColor: "#000", shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 }, shadowRadius: 8, elevation: 3, marginBottom: 16 }}>
                {students.map((s, idx) => (
                  <View
                    key={s.id}
                    style={{ flexDirection: "row", alignItems: "center", padding: 14, borderBottomWidth: idx < students.length - 1 ? 1 : 0, borderBottomColor: "#f1f5f9" }}
                  >
                    <Avatar name={s.name} size={38} />
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={{ fontSize: 14, fontWeight: "600", color: "#0f172a" }}>{s.name}</Text>
                      <Text style={{ fontSize: 12, color: "#94a3b8" }}>{s.email}</Text>
                    </View>
                    <View style={{ flexDirection: "row", gap: 6 }}>
                      {statusConfig.map((sc) => (
                        <TouchableOpacity
                          key={sc.key}
                          onPress={() => setStatus(s.id, sc.key)}
                          style={{ width: 32, height: 32, borderRadius: 8, alignItems: "center", justifyContent: "center", backgroundColor: s.status === sc.key ? sc.bg : "#f8fafc", borderWidth: 1.5, borderColor: s.status === sc.key ? sc.color : "#e2e8f0" }}
                        >
                          <Text style={{ fontSize: 11, fontWeight: "800", color: s.status === sc.key ? sc.color : "#94a3b8" }}>{sc.label}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Save Button */}
            <TouchableOpacity
              onPress={handleSave}
              disabled={saving}
              style={{ borderRadius: 16, paddingVertical: 15, alignItems: "center", backgroundColor: saving ? "#e2e8f0" : "#0ea5e9", marginBottom: 24 }}
            >
              <Text style={{ fontSize: 16, fontWeight: "700", color: saving ? "#94a3b8" : "#fff" }}>
                {saving ? "Saving..." : "Save Attendance"}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
