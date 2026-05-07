import { Redirect } from "expo-router";
import { useAuthStore } from "@/store/auth-store";
import { LoadingState } from "@/components/ui/LoadingState";

export default function Index() {
  const { user, hydrated } = useAuthStore();

  if (!hydrated) return <LoadingState label="Loading EduManage..." />;
  if (user) return <Redirect href="/(app)" />;
  return <Redirect href="/(auth)/signin" />;
}
