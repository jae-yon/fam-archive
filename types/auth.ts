export type AuthTokenPayload = {
  id: string;
  email: string;
}

export type AuthUser = {
  id: string;
  email: string;
  alias: string | null;
}

export type LoginRequest = {
  email: string;
  password: string;
}

export type LoginResponse = {
  user: AuthUser;
  access_token: string;
}