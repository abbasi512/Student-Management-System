import React, { useEffect, useState, useCallback } from "react";
import {
  View, Text, ScrollView, RefreshControl,
  TouchableOpacity, Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { api } from "@/lib/api";
import { LoadingState } from "@/components/ui/LoadingState";
import type { Notification } from "@/lib/types";

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get<Notification[]>("/notifications");
      setNotifications(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const onRefresh = () => { setRefreshing(true); load(); };

  const markAsRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
    } catch {
      // ignore
    }
  };

  const markAllRead = async () => {
    setMarkingAll(true);
    try {
      await api.patch("/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.message ?? "Failed to mark all as read.");
    } finally {
      setMarkingAll(false);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (loading) return <LoadingState message="Loading notifications..." />;

  const typeIcon = (type?: string) => {
    switch (type) {
      case "ASSIGNMENT": return { name: "clipboard-outline", color: "#8b5cf6" };
      case "GRADE": return { name: "star-outline", color: "#f59e0b" };
      case "ENROLLMENT": return { name: "person-add-outline", color: "#10b981" };
      case "ATTENDANCE": return { name: "calendar-outline", color: "#0ea5e9" };
      default: return { name: "notifications-outline", color: "#64748b" };
    }
  };

  const relativeTime = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f8fafc" }} edges={["bottom"]}>
      {/* Header bar */}
      {unreadCount > 0 && (
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingVertical: 10, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#f1f5f9" }}>
          <Text style={{ fontSize: 13, color: "#64748b" }}>
            {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
          </Text>
          <TouchableOpacity onPress={markAllRead} disabled={markingAll}>
            <Text style={{ fontSize: 13, fontWeight: "600", color: markingAll ? "#94a3b8" : "#0ea5e9" }}>
              {markingAll ? "Marking..." : "Mark all read"}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{ padding: 16 }}
      >
        {notifications.length === 0 ? (
          <View style={{ alignItems: "center", paddingVertical: 80 }}>
            <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: "#f1f5f9", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
              <Ionicons name="notifications-outline" size={36} color="#cbd5e1" />
            </View>
            <Text style={{ fontSize: 16, fontWeight: "600", color: "#94a3b8" }}>No notifications yet</Text>
            <Text style={{ fontSize: 13, color: "#cbd5e1", marginTop: 4 }}>You're all caught up!</Text>
          </View>
        ) : (
          notifications.map((n) => {
            const icon = typeIcon(n.type);
            return (
              <TouchableOpacity
                key={n.id}
                onPress={() => !n.read && markAsRead(n.id)}
                style={{
                  flexDirection: "row", alignItems: "flex-start", padding: 14,
                  backgroundColor: n.read ? "#fff" : "#eff6ff",
                  borderRadius: 16, marginBottom: 8,
                  borderWidth: 1, borderColor: n.read ? "#f1f5f9" : "#bfdbfe",
                  shadowColor: "#000", shadowOpacity: 0.04, shadowOffset: { width: 0, height: 1 }, shadowRadius: 4, elevation: 1,
                }}
              >
                <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: icon.color + "20", alignItems: "center", justifyContent: "center", marginRight: 12, flexShrink: 0 }}>
                  <Ionicons name={icon.name as any} size={20} color={icon.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: n.read ? "400" : "600", color: "#0f172a", lineHeight: 20 }}>
                    {n.message}
                  </Text>
                  <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4, gap: 8 }}>
                    <Text style={{ fontSize: 12, color: "#94a3b8" }}>{relativeTime(n.createdAt)}</Text>
                    {!n.read && (
                      <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: "#0ea5e9" }} />
                    )}
                  </View>
                </View>
                {!n.read && (
                  <TouchableOpacity onPress={() => markAsRead(n.id)} style={{ padding: 4 }}>
                    <Ionicons name="checkmark-circle-outline" size={20} color="#0ea5e9" />
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
