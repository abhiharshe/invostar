export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthUser {
  id: string;
  name: string;
  username: string;
  role: string;
}

export interface LoginResponseData {
  accessToken: string;
  user: AuthUser;
}
