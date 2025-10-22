// APIクライアントの設定
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1";

// APIレスポンスの型定義
export interface ApiResponse<T> {
  message: string;
  data: T;
}

export interface AuthToken {
  access_token: string;
  refresh_token: string;
  expires_at: string;
  token_type: string;
}

export interface User {
  id: number;
  email: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  user: User;
  token: AuthToken;
}

export interface SignUpRequest {
  email: string;
  password: string;
  name: string;
}

export interface SignInRequest {
  email: string;
  password: string;
}

// APIクライアントクラス
export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;

    const defaultHeaders = {
      "Content-Type": "application/json",
    };

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "APIリクエストに失敗しました");
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("ネットワークエラーが発生しました");
    }
  }

  // サインアップ
  async signUp(data: SignUpRequest): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>("/auth/signup", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // サインイン
  async signIn(data: SignInRequest): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>("/auth/signin", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }
}

// デフォルトのAPIクライアントインスタンス
export const apiClient = new ApiClient();
