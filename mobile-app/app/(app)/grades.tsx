import React, { useEffect, useState, useCallback } from "react";
import {
  View, Text, ScrollView, RefreshControl,
  TouchableOpacity, Modal, TextInput, KeyboardAvoidingView, Platform, Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import { LoadingState } from "@/components/ui/LoadingState";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";

interface Submission {
  id: string;
  content: string;
  submittedAt: string;
  status: "SUBMITTED" | "GRADED";
  grade?: { score: number; feedback?: string | null } | null;
  student: { id: string; name: string; email: string; avatar?: string | null };
}

interface AssignmentWithSubs {
  id: string;
  title: string;
  dueDate: string;
  course?: { id: string; code: string; title: string };
  submissions: Submission[];
}

type Filter = "pending" | "graded" | "all";

export default function GradesScreen() {
  const { user } = useAuthStore();
  const [assignments, setAssignments] = useState<AssignmentWithSubs[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<Filter>("pending");
  const [gradeTarget, setGradeTarget] = useState<{ submissionId: string; studentName: string; assignmentTitle: string; existingScore?: number; existingFeedback?: string } | null>(null);
  const [score, setScore] = useState("");
  const [feedback, setFeedback] = useState("");
  const [saving, setSaving] = useState(false);

  const isStudent = user?.role === "STUDENT";

  const load = useCallback(async () => {
    try {
      const { data } = await api.get<AssignmentWithSubs[]>("/assignments");
      setAssignments(Array.isArray(data) ? data : []);
    } catch {
      setAssignments([]);
    } finally {
      setLoading(false); setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  const onRefresh = () => { setRefreshing(true); load(); };

  const openGrade = (sub: Submission, assignment: AssignmentWithSubs) => {
    setGradeTarget({
      submissionId: sub.id,
      studentName: sub.student.name,
      assignmentTitle: assignment.title,
      existingScore: sub.grade?.score,
      existingFeedback: sub.grade?.feedback ?? "",
    });
    setScore(sub.grade?.score != null ? String(sub.grade.score) : "");
    setFeedback(sub.grade?.feedback ?? "");
  };

  const handleGrade = async () => {
    if (!gradeTarget) return;
    const s = Number(score);
    if (isNaN(s) || s < 0 || s > 100) {
      Alert.alert("Invalid Score", "Score must be between 0 and 100.");
      return;
    }
    setSaving(true);
    try {
      await api.post("/assignments/grade", {
        submissionId: gradeTarget.submissionId,
        score: s,
        feedback: feedback.trim() || undefined,
      });
      setGradeTarget(null);
      load();
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.message ?? "Failed to save grade.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState message="Loading grades..." />;

  // For students: show their own grades
  if (isStudent) {
    const myGrades = assignments.flatMap((a) =>
      a.submissions.filter((s) => s.grade).map((s) => ({ assignment: a, submission: s }))
    );
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#f8fafc" }} edges={["bottom"]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerStyle={{ padding: 16 }}
        >
          {myGrades.length === 0 ? (
            <View style={{ alignItems: "center", paddingVertical: 60 }}>
              <Ionicons name="star-outline" size={48} color="#cbd5e1" />
              <Text style={{ color: "#94a3b8", fontSize: 15, marginTop: 12 }}>No grades yet</Text>
            </View>
          ) : (
            myGrades.map(({ assignment, submission }) => (
              <View key={submission.id} style={{ backgroundColor: "#fff", borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: "#000", shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 }, shadowRadius: 6, elevation: 2 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <View style={{ flex: 1, marginRight: 12 }}>
                    <Text style={{ fontSize: 15, fontWeight: "700", color: "#0f172a" }}>{assignment.title}</Text>
                    {assignment.course && <Text style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{assignment.course.title} · {assignment.course.code}</Text>}
                  </View>
                  <View style={{ backgroundColor: submission.grade!.score >= 70 ? "#d1fae5" : submission.grade!.score >= 50 ? "#fef3c7" : "#fee2e2", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8 }}>
                    <Text style={{ fontSize: 20, fontWeight: "800", color: submission.grade!.score >= 70 ? "#065f46" : submission.grade!.score >= 50 ? "#92400e" : "#991b1b" }}>
                      {submission.grade!.score}%
                    </Text>
                  </View>
                </View>
                {submission.grade?.feedback && (
                  <View style={{ marginTop: 10, padding: 10, backgroundColor: "#f8fafc", borderRadius: 10 }}>
                    <Text style={{ fontSize: 12, color: "#64748b", fontStyle: "italic" }}>{submission.grade.feedback}</Text>
                  </View>
                )}
              </View>
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // For teachers/admins: grade submissions
  const allSubmissions = assignments.flatMap((a) =>
    a.submissions.map((s) => ({ assignment: a, submission: s }))
  );
  const filteredSubs = allSubmissions.filter(({ submission: s }) => {
    if (filter === "pending") return s.status === "SUBMITTED" && !s.grade;
    if (filter === "graded") return s.status === "GRADED" || !!s.grade;
    return true;
  });

  const pendingCount = allSubmissions.filter(({ submission: s }) => s.status === "SUBMITTED" && !s.grade).length;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f8fafc" }} edges={["bottom"]}>
      {/* Filter Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12, gap: 8 }}>
        {([["pending", `Pending (${pendingCount})`], ["graded", "Graded"], ["all", "All"]] as const).map(([key, label]) => (
          <TouchableOpacity
            key={key}
            onPress={() => setFilter(key)}
            style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: filter === key ? "#0ea5e9" : "#fff", borderWidth: 1, borderColor: filter === key ? "#0ea5e9" : "#e2e8f0" }}
          >
            <Text style={{ fontSize: 13, fontWeight: "600", color: filter === key ? "#fff" : "#475569" }}>{label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{ padding: 16, paddingTop: 0 }}
      >
        {filteredSubs.length === 0 ? (
          <View style={{ alignItems: "center", paddingVertical: 60 }}>
            <Ionicons name="checkmark-circle-outline" size={48} color="#cbd5e1" />
            <Text style={{ color: "#94a3b8", fontSize: 15, marginTop: 12 }}>
              {filter === "pending" ? "No pending submissions" : "No submissions found"}
            </Text>
          </View>
        ) : (
          filteredSubs.map(({ assignment, submission: s }) => (
            <View key={s.id} style={{ backgroundColor: "#fff", borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: "#000", shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 }, shadowRadius: 6, elevation: 2 }}>
              <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
                <Avatar name={s.student.name} size={40} imageUrl={s.student.avatar} />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={{ fontSize: 14, fontWeight: "700", color: "#0f172a" }}>{s.student.name}</Text>
                  <Text style={{ fontSize: 12, color: "#64748b" }}>{assignment.title}</Text>
                  {assignment.course && <Text style={{ fontSize: 11, color: "#94a3b8" }}>{assignment.course.title}</Text>}
                </View>
                {s.grade ? (
                  <View style={{ backgroundColor: "#d1fae5", borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 }}>
                    <Text style={{ fontSize: 14, fontWeight: "700", color: "#065f46" }}>{s.grade.score}%</Text>
                  </View>
                ) : (
                  <Badge label="Pending" color="amber" />
                )}
              </View>

              <View style={{ marginTop: 10, padding: 10, backgroundColor: "#f8fafc", borderRadius: 10 }}>
                <Text style={{ fontSize: 13, color: "#475569" }} numberOfLines={3}>{s.content}</Text>
              </View>

              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                <Text style={{ fontSize: 11, color: "#94a3b8" }}>
                  Submitted {new Date(s.submittedAt).toLocaleDateString()}
                </Text>
                <TouchableOpacity
                  onPress={() => openGrade(s, assignment)}
                  style={{ paddingHorizontal: 14, paddingVertical: 7, borderRadius: 10, backgroundColor: s.grade ? "#f8fafc" : "#0ea5e9", borderWidth: s.grade ? 1 : 0, borderColor: "#e2e8f0" }}
                >
                  <Text style={{ fontSize: 13, fontWeight: "600", color: s.grade ? "#475569" : "#fff" }}>
                    {s.grade ? "Edit Grade" : "Grade"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Grade Modal */}
      <Modal visible={!!gradeTarget} animationType="slide" transparent>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
          <View style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.4)" }}>
            <View style={{ backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <Text style={{ fontSize: 18, fontWeight: "700", color: "#0f172a" }}>Grade Submission</Text>
                <TouchableOpacity onPress={() => setGradeTarget(null)}>
                  <Ionicons name="close" size={24} color="#64748b" />
                </TouchableOpacity>
              </View>
              <Text style={{ fontSize: 13, color: "#64748b", marginBottom: 16 }}>
                {gradeTarget?.studentName} · {gradeTarget?.assignmentTitle}
              </Text>

              <Text style={{ fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 6 }}>Score (0–100)</Text>
              <TextInput
                style={{ borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 12, padding: 12, fontSize: 24, fontWeight: "700", color: "#0f172a", textAlign: "center", marginBottom: 14 }}
                placeholder="85"
                placeholderTextColor="#94a3b8"
                keyboardType="number-pad"
                value={score}
                onChangeText={setScore}
              />

              <Text style={{ fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 6 }}>Feedback (optional)</Text>
              <TextInput
                style={{ borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 12, padding: 12, fontSize: 14, color: "#0f172a", minHeight: 80, textAlignVertical: "top", marginBottom: 16 }}
                placeholder="Great work! Consider improving..."
                placeholderTextColor="#94a3b8"
                multiline
                value={feedback}
                onChangeText={setFeedback}
              />

              <TouchableOpacity
                onPress={handleGrade}
                disabled={saving || !score.trim()}
                style={{ borderRadius: 14, paddingVertical: 14, alignItems: "center", backgroundColor: saving || !score.trim() ? "#e2e8f0" : "#0ea5e9" }}
              >
                <Text style={{ fontSize: 15, fontWeight: "700", color: saving || !score.trim() ? "#94a3b8" : "#fff" }}>
                  {saving ? "Saving..." : gradeTarget?.existingScore != null ? "Update Grade" : "Submit Grade"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}
