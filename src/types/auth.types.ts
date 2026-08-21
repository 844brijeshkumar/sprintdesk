export interface AuthUser {
  id: number | string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  gender?: string;
  image?: string;
  avatar?: string;
  role?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
  expiresInMins?: number;
}

export interface LoginApiResponse {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  gender: string;
  image: string;
  token?: string;
  accessToken?: string;
  refreshToken: string;
}

export interface RefreshApiResponse {
  token?: string;
  accessToken?: string;
  refreshToken: string;
}

export interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  setAccessToken: (token: string | null) => void;
  initAuth: () => Promise<void>;
}
