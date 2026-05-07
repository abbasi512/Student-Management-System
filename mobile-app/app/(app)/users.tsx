import React, { useEffect, useState, useCallback } from "react";
import { View, Text, ScrollView, RefreshControl, TouchableOpacity, Alert, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import { LoadingState } from "@/components/ui/LoadingState";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import type { User, Role } from "@/lib/types";

const ROLES: Role[] = ["STUDENT", "TEACHER", "ADMIN"];
const roleColor: Record<Role, "sky" | "green" | "purple"> = {
  STUDENT: "sky",
  TEACHER: "green",
  ADMIN: "purple",
};

export default function UsersScreen() {
  const { user: me } = useAuthStore();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [roleTarget, setRoleTarget] = useState<User | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get<User[]>("/users");
      setUsers(Array.isArray(data) ? data : []);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false); setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  const onRefresh = () => { setRefreshing(true); load(); };

  const handleChangeRole = async (userId: string, role: Role) => {
    setSaving(true);
    try {
      await api.put(`/users/${userId}`, { role });
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, role } : u));
      setRoleTarget(null);
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.message ?? "Failed to update role.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (u: User) => {
    if (u.id === me?.id) {
      Alert.alert("Error", "You cannot delete your own account.");
      return;
    }
    Alert.alert(
      "Delete User",
      `Are you sure you want to delete ${u.name}? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete", style: "destructive",
          onPress: async () => {
            try {
              await api.delete(`/users/${u.id}`);
              setUsers((prev) => prev.filter((x) => x.id !== u.id));
            } catch (e: any) {
              Alert.alert("Error", e?.response?.data?.message ?? "Failed to delete user.");
            }
          },
        },
      ]
    );
  };

  const counts = ROLES.reduce((acc, r) => ({ ...acc, [r]: users.filter((u) => u.role === r).length }), {} as Record<Role, number>);

  if (loading) return <LoadingState message="Loading users..." />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f8fafc" }} edges={["bottom"]}>
      {/* Summary Row */}
      <View style={{ flexDirection: "row", paddingHorizontal: 16, paddingVertical: 12, gap: 10 }}>
        {ROLES.map((r) => (
          <View key={r} style={{ flex: 1, backgroundColor: "#fff", borderRadius: 14, padding: 12, alignItems: "center", shadowColor: "#000", shadowOpacity: 0.04, shadowOffset: { width: 0, height: 1 }, shadowRadius: 4, elevation: 2 }}>
            <Text style={{ fontSize: 20, fontWeight: "700", color: "#0f172a" }}>{counts[r]}</Text>
            <Text style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>{r[0] + r.slice(1).toLowerCase()}s</Text>
          </View>
        ))}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{ padding: 16, paddingTop: 4 }}
      >
        {users.length === 0 ? (
          <View style={{ alignItems: "center", paddingVertical: 60 }}>
            <Ionicons name="people-outline" size={48} color="#cbd5e1" />
            <Text style={{ color: "#94a3b8", fontSize: 15, marginTop: 12 }}>No users found</Text>
          </View>
        ) : (
          users.map((u) => (
            <View key={u.id} style={{ backgroundColor: "#fff", borderRadius: 16, padding: 14, marginBottom: 10, shadowColor: "#000", shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 }, shadowRadius: 6, elevation: 2 }}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Avatar name={u.name} size={44} imageUrl={u.avatar} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <Text style={{ fontSize: 14, fontWeight: "700", color: "#0f172a" }}>{u.name}</Text>
                    {u.id === me?.id && <Text style={{ fontSize: 11, color: "#0ea5e9" }}>(you)</Text>}
                  </View>
                  <Text style={{ fontSize: 12, color: "#64748b", marginTop: 1 }}>{u.email}</Text>
                  <View style={{ marginTop: 6 }}>
                    <Badge label={u.role} color={roleColor[u.role]} />
                  </View>
                </View>

                <View style={{ gap: 8 }}>
                  <TouchableOpacity
                    onPress={() => setRoleTarget(u)}
                    style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: "#eff6ff", alignItems: "center", justifyContent: "center" }}
                  >
                    <Ionicons name="shield-outline" size={17} color="#0ea5e9" />
                  </TouchableOpacity>
                  {u.id !== me?.id && (
                    <TouchableOpacity
                      onPress={() => handleDelete(u)}
                      style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: "#fef2f2", alignItems: "center", justifyContent: "center" }}
                    >
                      <Ionicons name="trash-outline" size={17} color="#ef4444" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {(u.studentProfile?.studentId || u.teacherProfile?.employeeId) && (
                <View style={{ marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: "#f1f5f9" }}>
                  <Text style={{ fontSize: 12, color: "#94a3b8" }}>
                    {u.studentProfile?.studentId ? `Student ID: ${u.studentProfile.studentId}` : `Employee ID: ${u.teacherProfile?.employeeId}`}
                  </Text>
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>

      {/* Role Change Modal */}
      <Modal visible={!!roleTarget} animationType="slide" transparent>
        <View style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.4)" }}>
          <View style={{ backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <Text style={{ fontSize: 18, fontWeight: "700", color: "#0f172a" }}>Change Role</Text>
              <TouchableOpacity onPress={() => setRoleTarget(null)}>
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>
            <Text style={{ fontSize: 13, color: "#64748b", marginBottom: 16 }}>
              Changing role for: <Text style={{ fontWeight: "600", color: "#0f172a" }}>{roleTarget?.name}</Text>
            </Text>
            {ROLES.map((r) => (
              <TouchableOpacity
                key={r}
                onPress={() => roleTarget && handleChangeRole(roleTarget.id, r)}
                disabled={saving || roleTarget?.role === r}
                style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 14, borderRadius: 14, marginBottom: 8, backgroundColor: roleTarget?.role === r ? "#f0f9ff" : "#f8fafc", borderWidth: 1.5, borderColor: roleTarget?.role === r ? "#0ea5e9" : "#e2e8f0" }}
              >
                <Text style={{ fontSize: 14, fontWeight: "600", color: roleTarget?.role === r ? "#0ea5e9" : "#374151" }}>
                  {r[0] + r.slice(1).toLowerCase()}
                </Text>
                {roleTarget?.role === r && <Ionicons name="checkmark-circle" size={20} color="#0ea5e9" />}
              </TouchableOpacity>
            ))}
            {saving && <Text style={{ textAlign: "center", color: "#94a3b8", marginTop: 8 }}>Saving...</Text>}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
