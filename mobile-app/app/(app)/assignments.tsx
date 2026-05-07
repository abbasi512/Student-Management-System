import React, { useEffect, useState, useCallback } from "react";
import {
  View, Text, ScrollView, RefreshControl,
  TouchableOpacity, Alert, Modal, TextInput, KeyboardAvoidingView, Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import { LoadingState } from "@/components/ui/LoadingState";
import { Badge } from "@/components/ui/Badge";
import type { Assignment } from "@/lib/types";

type Filter = "all" | "pending" | "submitted" | "graded";

export default function AssignmentsScreen() {
  const { user } = useAuthStore();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");
  const [selected, setSelected] = useState<Assignment | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [content, setContent] = useState("");

  const isStaff = user?.role === "TEACHER" || user?.role === "ADMIN";

  const load = useCallback(async () => {
    try {
      const { data } = await api.get<Assignment[]>("/assignments");
      setAssignments(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const onRefresh = () => { setRefreshing(true); load(); };

  const getSub = (a: Assignment) => a.submission ?? a.submissions?.[0] ?? null;

  const filtered = assignments.filter((a) => {
    const sub = getSub(a);
    if (filter === "pending") return !sub;
    if (filter === "submitted") return sub && (sub.grade == null && sub.score == null);
    if (filter === "graded") return sub && (sub.grade != null || sub.score != null);
    return true;
  });

  const handleSubmit = async () => {
    if (!selected || !content.trim()) return;
    setSubmitting(true);
    try {
      await api.post(`/assignments/${selected.id}/submit`, { content });
      Alert.alert("Submitted!", "Your assignment has been submitted.");
      setSelected(null);
      setContent("");
      load();
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.message ?? "Submission failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const statusInfo = (a: Assignment) => {
    const sub = getSub(a);
    if (!sub) return { label: "Pending", color: "amber" as const };
    const grade = sub.grade ?? sub.score;
    if (grade != null) return { label: `Graded: ${grade}`, color: "green" as const };
    return { label: "Submitted", color: "sky" as const };
  };

  if (loading) return <LoadingState message="Loading assignments..." />;

  const filterTabs: { key: Filter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "pending", label: "Pending" },
    { key: "submitted", label: "Submitted" },
    { key: "graded", label: "Graded" },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f8fafc" }} edges={["bottom"]}>
      {/* Filter Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12, gap: 8 }}
      >
        {filterTabs.map((t) => (
          <TouchableOpacity
            key={t.key}
            onPress={() => setFilter(t.key)}
            style={{
              paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
              backgroundColor: filter === t.key ? "#0ea5e9" : "#fff",
              borderWidth: 1, borderColor: filter === t.key ? "#0ea5e9" : "#e2e8f0",
            }}
          >
            <Text style={{ fontSize: 13, fontWeight: "600", color: filter === t.key ? "#fff" : "#475569" }}>
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{ padding: 16, paddingTop: 0 }}
      >
        {filtered.length === 0 ? (
          <View style={{ alignItems: "center", paddingVertical: 60 }}>
            <Ionicons name="clipboard-outline" size={48} color="#cbd5e1" />
            <Text style={{ color: "#94a3b8", fontSize: 15, marginTop: 12 }}>No assignments found</Text>
          </View>
        ) : (
          filtered.map((a) => {
            const { label, color } = statusInfo(a);
            const isOverdue = a.dueDate && new Date(a.dueDate) < new Date() && !a.submissions?.[0];
            return (
              <TouchableOpacity
                key={a.id}
                onPress={() => { if (!isStaff) { setSelected(a); setContent(getSub(a)?.content ?? ""); } }}
                style={{ backgroundColor: "#fff", borderRadius: 18, padding: 16, marginBottom: 12, shadowColor: "#000", shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 }, shadowRadius: 8, elevation: 3 }}
              >
                <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" }}>
                  <View style={{ flex: 1, marginRight: 10 }}>
                    <Text style={{ fontSize: 15, fontWeight: "700", color: "#0f172a", marginBottom: 4 }}>{a.title}</Text>
                    {a.course && (
                      <Text style={{ fontSize: 12, color: "#64748b", marginBottom: 6 }}>{a.course.name} · {a.course.code}</Text>
                    )}
                    {a.description && (
                      <Text style={{ fontSize: 13, color: "#94a3b8" }} numberOfLines={2}>{a.description}</Text>
                    )}
                  </View>
                  <Badge label={label} color={color} />
                </View>

                <View style={{ flexDirection: "row", alignItems: "center", marginTop: 10, gap: 12 }}>
                  {a.dueDate && (
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      <Ionicons name="calendar-outline" size={13} color={isOverdue ? "#ef4444" : "#94a3b8"} />
                      <Text style={{ fontSize: 12, color: isOverdue ? "#ef4444" : "#94a3b8", marginLeft: 4 }}>
                        {isOverdue ? "Overdue · " : "Due · "}{new Date(a.dueDate).toLocaleDateString()}
                      </Text>
                    </View>
                  )}
                  {a.maxScore && (
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      <Ionicons name="star-outline" size={13} color="#94a3b8" />
                      <Text style={{ fontSize: 12, color: "#94a3b8", marginLeft: 4 }}>{a.maxScore} pts</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* Submit Modal */}
      <Modal visible={!!selected} animationType="slide" transparent>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
          <View style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.4)" }}>
            <View style={{ backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <Text style={{ fontSize: 18, fontWeight: "700", color: "#0f172a" }}>Submit Assignment</Text>
                <TouchableOpacity onPress={() => setSelected(null)}>
                  <Ionicons name="close" size={24} color="#64748b" />
                </TouchableOpacity>
              </View>
              <Text style={{ fontSize: 14, color: "#64748b", marginBottom: 12 }}>{selected?.title}</Text>
              <TextInput
                style={{ borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 12, padding: 14, fontSize: 14, color: "#0f172a", minHeight: 120, textAlignVertical: "top", marginBottom: 16 }}
                placeholder="Write your answer here..."
                placeholderTextColor="#94a3b8"
                multiline
                value={content}
                onChangeText={setContent}
              />
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={submitting || !content.trim()}
                style={{ borderRadius: 14, paddingVertical: 14, alignItems: "center", backgroundColor: submitting || !content.trim() ? "#e2e8f0" : "#0ea5e9" }}
              >
                <Text style={{ fontSize: 15, fontWeight: "700", color: submitting || !content.trim() ? "#94a3b8" : "#fff" }}>
                  {submitting ? "Submitting..." : (selected ? getSub(selected) : null) ? "Update Submission" : "Submit"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}
