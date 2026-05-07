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
      .then(({ data }) => setCount(data.filter((n) => !n.read).length))
      .catch(() => null);
  }, []);

  return (
    <TouchableOpacity onPress={() => router.push("/(app)/notifications")} className="mr-4">
      <Ionicons name="notifications-outline" size={24} color="#0f172a" />
      {count > 0 && (
        <View className="absolute -top-1 -right-1 bg-rose-500 rounded-full min-w-[16px] h-4 items-center justify-center px-0.5">
          <Text className="text-white text-[10px] font-bold">{count > 99 ? "99+" : count}</Text>
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

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: "#0284c7",
        tabBarInactiveTintColor: "#94a3b8",
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopColor: "#e2e8f0",
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 4,
        },
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
        options={{
          title: "Courses",
          headerTitle: "Courses",
          tabBarIcon: ({ color, size }) => <Ionicons name="book-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="courses/[id]"
        options={{ href: null, headerTitle: "Course Detail" }}
      />
      <Tabs.Screen
        name="assignments"
        options={{
          title: "Assignments",
          headerTitle: "Assignments",
          tabBarIcon: ({ color, size }) => <Ionicons name="clipboard-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="attendance"
        options={{
          title: "Attendance",
          headerTitle: "Attendance",
          tabBarIcon: ({ color, size }) => <Ionicons name="calendar-outline" size={size} color={color} />,
          href: isStaff ? "/(app)/attendance" : null,
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
