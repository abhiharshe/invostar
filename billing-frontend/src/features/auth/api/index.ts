import { api } from "@/services/api";
import { ApiResponse } from "@/types/api";
import { LoginCredentials, LoginResponseData, AuthUser } from "../types";

export async function loginApi(credentials: LoginCredentials): Promise<LoginResponseData> {
  const response = await api.post<ApiResponse<LoginResponseData>>("/auth/login", credentials);
  return response.data.data;
}

export async function getProfileApi(): Promise<AuthUser> {
  const response = await api.get<ApiResponse<AuthUser>>("/auth/me");
  return response.data.data;
}
