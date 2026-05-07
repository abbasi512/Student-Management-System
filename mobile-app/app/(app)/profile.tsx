import React, { useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  Alert, TextInput, KeyboardAvoidingView, Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import { useAuthStore } from "@/store/auth-store";
import { api } from "@/lib/api";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

interface ProfileForm {
  name: string;
  email: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function ProfileScreen() {
  const { user, logout, setUser } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ProfileForm>({
    name: user?.name ?? "",
    email: user?.email ?? "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const roleColor = (): "sky" | "purple" | "green" => {
    if (user?.role === "ADMIN") return "purple";
    if (user?.role === "TEACHER") return "green";
    return "sky";
  };

  const handleSaveProfile = async () => {
    if (!form.name.trim() || !form.email.trim()) {
      Alert.alert("Error", "Name and email are required.");
      return;
    }
    setSaving(true);
    try {
      const { data } = await api.patch("/users/me", { name: form.name.trim(), email: form.email.trim() });
      setUser(data);
      setEditing(false);
      Alert.alert("Saved", "Profile updated successfully.");
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.message ?? "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (form.newPassword.length < 6) {
      Alert.alert("Error", "New password must be at least 6 characters.");
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }
    setSaving(true);
    try {
      await api.patch("/auth/change-password", {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      setChangingPassword(false);
      setForm((prev) => ({ ...prev, currentPassword: "", newPassword: "", confirmPassword: "" }));
      Alert.alert("Changed", "Password updated successfully.");
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.message ?? "Failed to change password.");
    } finally {
      setSaving(false);
    }
  };

  const handlePickAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (result.canceled) return;

    const uri = result.assets[0].uri;
    const formData = new FormData();
    formData.append("avatar", { uri, name: "avatar.jpg", type: "image/jpeg" } as any);

    try {
      const { data } = await api.patch("/users/me/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUser(data);
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.message ?? "Failed to upload avatar.");
    }
  };

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: () => logout() },
    ]);
  };

  if (!user) return null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f8fafc" }} edges={["bottom"]}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <LinearGradient
            colors={["#0ea5e9", "#4f46e5"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ paddingHorizontal: 20, paddingTop: 32, paddingBottom: 64, alignItems: "center" }}
          >
            <TouchableOpacity onPress={handlePickAvatar} style={{ marginBottom: 12 }}>
              <Avatar name={user.name} size={80} imageUrl={user.avatar} />
              <View style={{ position: "absolute", bottom: 0, right: 0, width: 24, height: 24, borderRadius: 12, backgroundColor: "#fff", alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOpacity: 0.15, shadowOffset: { width: 0, height: 1 }, shadowRadius: 3, elevation: 2 }}>
                <Ionicons name="camera" size={13} color="#0ea5e9" />
              </View>
            </TouchableOpacity>
            <Text style={{ color: "#fff", fontSize: 22, fontWeight: "700" }}>{user.name}</Text>
            <Text style={{ color: "#bae6fd", fontSize: 13, marginTop: 2 }}>{user.email}</Text>
            <View style={{ marginTop: 8 }}>
              <Badge label={user.role} color={roleColor()} />
            </View>
          </LinearGradient>

          <View style={{ marginTop: -24, marginHorizontal: 16 }}>
            {/* Profile Info / Edit */}
            <View style={{ backgroundColor: "#fff", borderRadius: 20, padding: 20, marginBottom: 14, shadowColor: "#000", shadowOpacity: 0.06, shadowOffset: { width: 0, height: 2 }, shadowRadius: 8, elevation: 3 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <Text style={{ fontSize: 16, fontWeight: "700", color: "#0f172a" }}>Personal Info</Text>
                {!editing && (
                  <TouchableOpacity onPress={() => setEditing(true)} style={{ flexDirection: "row", alignItems: "center" }}>
                    <Ionicons name="pencil-outline" size={15} color="#0ea5e9" />
                    <Text style={{ fontSize: 13, color: "#0ea5e9", fontWeight: "600", marginLeft: 4 }}>Edit</Text>
                  </TouchableOpacity>
                )}
              </View>

              {editing ? (
                <>
                  <FormField label="Full Name" value={form.name} onChangeText={(v) => setForm((p) => ({ ...p, name: v }))} placeholder="Your name" />
                  <FormField label="Email" value={form.email} onChangeText={(v) => setForm((p) => ({ ...p, email: v }))} placeholder="your@email.com" keyboardType="email-address" />
                  <View style={{ flexDirection: "row", gap: 10, marginTop: 8 }}>
                    <TouchableOpacity
                      onPress={() => { setEditing(false); setForm((p) => ({ ...p, name: user.name, email: user.email })); }}
                      style={{ flex: 1, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: "#e2e8f0", alignItems: "center" }}
                    >
                      <Text style={{ fontSize: 14, fontWeight: "600", color: "#64748b" }}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={handleSaveProfile}
                      disabled={saving}
                      style={{ flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: saving ? "#e2e8f0" : "#0ea5e9", alignItems: "center" }}
                    >
                      <Text style={{ fontSize: 14, fontWeight: "600", color: saving ? "#94a3b8" : "#fff" }}>
                        {saving ? "Saving..." : "Save"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                <>
                  <InfoRow icon="person-outline" label="Name" value={user.name} />
                  <InfoRow icon="mail-outline" label="Email" value={user.email} />
                  <InfoRow icon="shield-checkmark-outline" label="Role" value={user.role} />
                </>
              )}
            </View>

            {/* Change Password */}
            <View style={{ backgroundColor: "#fff", borderRadius: 20, padding: 20, marginBottom: 14, shadowColor: "#000", shadowOpacity: 0.06, shadowOffset: { width: 0, height: 2 }, shadowRadius: 8, elevation: 3 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: changingPassword ? 16 : 0 }}>
                <Text style={{ fontSize: 16, fontWeight: "700", color: "#0f172a" }}>Password</Text>
                {!changingPassword && (
                  <TouchableOpacity onPress={() => setChangingPassword(true)} style={{ flexDirection: "row", alignItems: "center" }}>
                    <Ionicons name="key-outline" size={15} color="#0ea5e9" />
                    <Text style={{ fontSize: 13, color: "#0ea5e9", fontWeight: "600", marginLeft: 4 }}>Change</Text>
                  </TouchableOpacity>
                )}
              </View>

              {changingPassword && (
                <>
                  <FormField label="Current Password" value={form.currentPassword} onChangeText={(v) => setForm((p) => ({ ...p, currentPassword: v }))} placeholder="Current password" secure />
                  <FormField label="New Password" value={form.newPassword} onChangeText={(v) => setForm((p) => ({ ...p, newPassword: v }))} placeholder="Min. 6 characters" secure />
                  <FormField label="Confirm Password" value={form.confirmPassword} onChangeText={(v) => setForm((p) => ({ ...p, confirmPassword: v }))} placeholder="Repeat new password" secure />
                  <View style={{ flexDirection: "row", gap: 10, marginTop: 8 }}>
                    <TouchableOpacity
                      onPress={() => setChangingPassword(false)}
                      style={{ flex: 1, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: "#e2e8f0", alignItems: "center" }}
                    >
                      <Text style={{ fontSize: 14, fontWeight: "600", color: "#64748b" }}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={handleChangePassword}
                      disabled={saving}
                      style={{ flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: saving ? "#e2e8f0" : "#0ea5e9", alignItems: "center" }}
                    >
                      <Text style={{ fontSize: 14, fontWeight: "600", color: saving ? "#94a3b8" : "#fff" }}>
                        {saving ? "Saving..." : "Update"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>

            {/* Danger Zone */}
            <TouchableOpacity
              onPress={handleLogout}
              style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", padding: 16, backgroundColor: "#fff", borderRadius: 20, borderWidth: 1, borderColor: "#fecaca", marginBottom: 32, shadowColor: "#000", shadowOpacity: 0.04, shadowOffset: { width: 0, height: 1 }, shadowRadius: 4, elevation: 1 }}
            >
              <Ionicons name="log-out-outline" size={20} color="#ef4444" />
              <Text style={{ fontSize: 15, fontWeight: "700", color: "#ef4444", marginLeft: 8 }}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#f1f5f9" }}>
      <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: "#f1f5f9", alignItems: "center", justifyContent: "center", marginRight: 12 }}>
        <Ionicons name={icon as any} size={17} color="#64748b" />
      </View>
      <View>
        <Text style={{ fontSize: 11, color: "#94a3b8", marginBottom: 1 }}>{label}</Text>
        <Text style={{ fontSize: 14, color: "#0f172a", fontWeight: "500" }}>{value}</Text>
      </View>
    </View>
  );
}

function FormField({
  label, value, onChangeText, placeholder, keyboardType, secure,
}: {
  label: string; value: string; onChangeText: (v: string) => void;
  placeholder?: string; keyboardType?: any; secure?: boolean;
}) {
  const [show, setShow] = useState(false);
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={{ fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 6 }}>{label}</Text>
      <View style={{ flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 12, paddingHorizontal: 14, backgroundColor: "#f8fafc" }}>
        <TextInput
          style={{ flex: 1, paddingVertical: 11, fontSize: 14, color: "#0f172a" }}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#94a3b8"
          keyboardType={keyboardType}
          secureTextEntry={secure && !show}
          autoCapitalize="none"
        />
        {secure && (
          <TouchableOpacity onPress={() => setShow((s) => !s)}>
            <Ionicons name={show ? "eye-off-outline" : "eye-outline"} size={18} color="#94a3b8" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
