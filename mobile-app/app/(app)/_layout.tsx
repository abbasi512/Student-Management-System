import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Tabs, useRouter, Redirect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "@/store/auth-store";
import { api } from "@/lib/api";
import type { Notification } from "@/lib/types";

function BellIcon() {
  const router = useRouter();
  const [count, setCount] = useState(0);

  useEffect(() => {
    api
      .get<Notification[]>("/notifications")
      .then(({ data }) => setCount(Array.isArray(data) ? data.filter((n) => !n.read).length : 0))
      .catch(() => null);
  }, []);

  return (
    <TouchableOpacity onPress={() => router.push("/(app)/notifications")} style={{ marginRight: 16 }}>
      <Ionicons name="notifications-outline" size={24} color="#0f172a" />
      {count > 0 && (
        <View style={{ position: "absolute", top: -4, right: -4, backgroundColor: "#f43f5e", borderRadius: 8, minWidth: 16, height: 16, alignItems: "center", justifyContent: "center", paddingHorizontal: 2 }}>
          <Text style={{ color: "#fff", fontSize: 10, fontWeight: "700" }}>{count > 99 ? "99+" : count}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function AppLayout() {
  const { user, hydrated } = useAuthStore();

  if (!hydrated) return null;
  if (!user) return <Redirect href="/(auth)/signin" />;

  const isStaff = user.role === "TEACHER" || user.role === "ADMIN";
  const isAdmin = user.role === "ADMIN";

  const tabBarStyle = {
    backgroundColor: "#fff",
    borderTopColor: "#e2e8f0",
    borderTopWidth: 1,
    height: 60,
    paddingBottom: 8,
    paddingTop: 4,
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: "#0284c7",
        tabBarInactiveTintColor: "#94a3b8",
        tabBarStyle,
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
        headerStyle: { backgroundColor: "#fff" },
        headerTitleStyle: { color: "#0f172a", fontSize: 17, fontWeight: "700" },
        headerShadowVisible: false,
        headerRight: () => <BellIcon />,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          headerTitle: "Dashboard",
          tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="courses/index"
        options={{ href: null, headerTitle: "Courses" }}
      />
      <Tabs.Screen
        name="courses/[id]"
        options={{ href: null, headerTitle: "Course Detail" }}
      />
      <Tabs.Screen
        name="create-course"
        options={{ href: null, headerShown: false }}
      />
      <Tabs.Screen
        name="assignments"
        options={{ href: null, headerTitle: "Assignments" }}
      />
      <Tabs.Screen
        name="grades"
        options={{
          href: null,
          headerTitle: isStudent(user.role) ? "My Grades" : "Grade Submissions",
        }}
      />
      <Tabs.Screen
        name="attendance"
        options={{ href: null, headerTitle: "Attendance" }}
      />
      <Tabs.Screen
        name="users"
        options={{
          title: "Users",
          headerTitle: "User Management",
          tabBarIcon: ({ color, size }) => <Ionicons name="people-outline" size={size} color={color} />,
          href: isAdmin ? "/(app)/users" : null,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{ href: null, headerTitle: "Notifications" }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          headerTitle: "My Profile",
          tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}

function isStudent(role: string) {
  return role === "STUDENT";
}
