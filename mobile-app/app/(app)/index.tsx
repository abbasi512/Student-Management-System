import React, { useEffect, useState, useCallback } from "react";
import { View, Text, ScrollView, RefreshControl, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "@/store/auth-store";
import { api } from "@/lib/api";
import { Avatar } from "@/components/ui/Avatar";
import { LoadingState } from "@/components/ui/LoadingState";
import type { Notification } from "@/lib/types";

interface DashboardStats {
  totalCourses: number;
  totalStudents?: number;
  totalAssignments: number;
  pendingAssignments: number;
  totalNotifications: number;
  unreadNotifications: number;
}

interface QuickAction {
  label: string;
  icon: string;
  color: string;
  href: string;
}

export default function DashboardScreen() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentNotifs, setRecentNotifs] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const isStaff = user?.role === "TEACHER" || user?.role === "ADMIN";

  const load = useCallback(async () => {
    try {
      const [statsRes, notifsRes] = await Promise.all([
        api.get<DashboardStats>("/dashboard/stats"),
        api.get<Notification[]>("/notifications"),
      ]);
      setStats(statsRes.data);
      setRecentNotifs(notifsRes.data.slice(0, 3));
    } catch {
      // ignore
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const onRefresh = () => { setRefreshing(true); load(); };

  const quickActions: QuickAction[] = [
    { label: "Courses", icon: "book-outline", color: "#0ea5e9", href: "/(app)/courses" },
    { label: "Assignments", icon: "clipboard-outline", color: "#8b5cf6", href: "/(app)/assignments" },
    { label: "Notifications", icon: "notifications-outline", color: "#f59e0b", href: "/(app)/notifications" },
    ...(isStaff ? [{ label: "Attendance", icon: "calendar-outline", color: "#10b981", href: "/(app)/attendance" }] : []),
    { label: "Profile", icon: "person-outline", color: "#ec4899", href: "/(app)/profile" },
  ];

  if (loading) return <LoadingState message="Loading dashboard..." />;

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f8fafc" }} edges={["bottom"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Hero */}
        <LinearGradient
          colors={["#0ea5e9", "#4f46e5"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ paddingHorizontal: 20, paddingTop: 24, paddingBottom: 48 }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: "#bae6fd", fontSize: 14 }}>{greeting()},</Text>
              <Text style={{ color: "#fff", fontSize: 22, fontWeight: "700", marginTop: 2 }} numberOfLines={1}>
                {user?.name ?? "User"}
              </Text>
              <Text style={{ color: "#bae6fd", fontSize: 13, marginTop: 2, textTransform: "capitalize" }}>
                {user?.role?.toLowerCase() ?? ""}
              </Text>
            </View>
            <TouchableOpacity onPress={() => router.push("/(app)/profile")}>
              <Avatar name={user?.name ?? "U"} size={48} />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <View style={{ marginTop: -24, marginHorizontal: 16 }}>
          {/* Stats Row */}
          {stats && (
            <View style={{ flexDirection: "row", gap: 12, marginBottom: 20 }}>
              <StatCard
                icon="book"
                label="Courses"
                value={stats.totalCourses}
                color="#0ea5e9"
              />
              <StatCard
                icon="clipboard"
                label="Due"
                value={stats.pendingAssignments}
                color="#f59e0b"
              />
              {isStaff && stats.totalStudents !== undefined && (
                <StatCard
                  icon="people"
                  label="Students"
                  value={stats.totalStudents}
                  color="#8b5cf6"
                />
              )}
              <StatCard
                icon="notifications"
                label="Unread"
                value={stats.unreadNotifications}
                color="#ec4899"
              />
            </View>
          )}

          {/* Quick Actions */}
          <View style={{ backgroundColor: "#fff", borderRadius: 20, padding: 16, marginBottom: 20, shadowColor: "#000", shadowOpacity: 0.06, shadowOffset: { width: 0, height: 2 }, shadowRadius: 8, elevation: 3 }}>
            <Text style={{ fontSize: 16, fontWeight: "700", color: "#0f172a", marginBottom: 14 }}>Quick Actions</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
              {quickActions.map((a) => (
                <TouchableOpacity
                  key={a.label}
                  onPress={() => router.push(a.href as any)}
                  style={{ width: "30%", alignItems: "center", padding: 12, borderRadius: 14, backgroundColor: "#f8fafc", borderWidth: 1, borderColor: "#f1f5f9" }}
                >
                  <View style={{ width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: a.color + "20", marginBottom: 6 }}>
                    <Ionicons name={a.icon as any} size={20} color={a.color} />
                  </View>
                  <Text style={{ fontSize: 11, fontWeight: "600", color: "#475569", textAlign: "center" }}>{a.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Recent Notifications */}
          {recentNotifs.length > 0 && (
            <View style={{ backgroundColor: "#fff", borderRadius: 20, padding: 16, marginBottom: 24, shadowColor: "#000", shadowOpacity: 0.06, shadowOffset: { width: 0, height: 2 }, shadowRadius: 8, elevation: 3 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <Text style={{ fontSize: 16, fontWeight: "700", color: "#0f172a" }}>Recent Notifications</Text>
                <TouchableOpacity onPress={() => router.push("/(app)/notifications")}>
                  <Text style={{ fontSize: 13, color: "#0ea5e9", fontWeight: "600" }}>See all</Text>
                </TouchableOpacity>
              </View>
              {recentNotifs.map((n) => (
                <View
                  key={n.id}
                  style={{ flexDirection: "row", alignItems: "flex-start", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#f1f5f9" }}
                >
                  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: n.read ? "#cbd5e1" : "#0ea5e9", marginTop: 6, marginRight: 10 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 13, fontWeight: n.read ? "400" : "600", color: "#0f172a" }} numberOfLines={2}>
                      {n.message}
                    </Text>
                    <Text style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
                      {new Date(n.createdAt).toLocaleDateString()}
                    </Text>
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

function StatCard({ icon, label, value, color }: { icon: string; label: string; value: number; color: string }) {
  return (
    <View style={{ flex: 1, backgroundColor: "#fff", borderRadius: 16, padding: 12, alignItems: "center", shadowColor: "#000", shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 }, shadowRadius: 6, elevation: 2 }}>
      <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: color + "20", alignItems: "center", justifyContent: "center", marginBottom: 6 }}>
        <Ionicons name={icon as any} size={18} color={color} />
      </View>
      <Text style={{ fontSize: 18, fontWeight: "700", color: "#0f172a" }}>{value}</Text>
      <Text style={{ fontSize: 11, color: "#94a3b8", marginTop: 1 }}>{label}</Text>
    </View>
  );
}
