import { useMutation, useQuery } from "@tanstack/react-query";
import { loginApi, getProfileApi } from "../api";
import { LoginCredentials } from "../types";
import { useAuthStore } from "@/stores/use-auth-store";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function useLoginMutation(targetRedirect?: string | null) {
  const setAuth = useAuthStore((state) => state.setAuth);
  const expiredRedirectUrl = useAuthStore((state) => state.expiredRedirectUrl);
  const router = useRouter();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => loginApi(credentials),
    onSuccess: (data) => {
      setAuth(data.accessToken, data.refreshToken, data.user);
      toast.success(`Welcome back, ${data.user.name}!`);

      const destination = targetRedirect || expiredRedirectUrl || "/dashboard";
      router.push(destination);
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
