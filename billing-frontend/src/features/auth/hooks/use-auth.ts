import { useMutation, useQuery } from "@tanstack/react-query";
import { loginApi, getProfileApi } from "../api";
import { LoginCredentials } from "../types";
import { useAuthStore } from "@/stores/use-auth-store";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function useLoginMutation() {
  const setAuth = useAuthStore((state) => state.setAuth);
  const router = useRouter();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => loginApi(credentials),
    onSuccess: (data) => {
      setAuth(data.accessToken, data.user);
      toast.success(`Welcome back, ${data.user.name}!`);
      router.push("/dashboard");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || "Login failed. Please check your credentials.";
      toast.error(typeof message === "string" ? message : message[0]);
    },
  });
}

export function useCurrentUserProfile() {
  const token = useAuthStore((state) => state.token);
  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: getProfileApi,
    enabled: Boolean(token),
  });
}
