import { apiClient, AuthResponse, SignUpRequest, SignInRequest } from "./api";

// 認証状態の型定義
export interface AuthState {
  user: AuthResponse["user"] | null;
  token: AuthResponse["token"] | null;
  isAuthenticated: boolean;
}

// 認証サービスクラス
export class AuthService {
  private static instance: AuthService;
  private authState: AuthState = {
    user: null,
    token: null,
    isAuthenticated: false,
  };

  private constructor() {
    this.loadAuthFromStorage();
  }

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // ローカルストレージから認証情報を読み込み
  private loadAuthFromStorage(): void {
    try {
      const storedAuth = localStorage.getItem("auth");
      if (storedAuth) {
        const authData = JSON.parse(storedAuth);
        this.authState = {
          user: authData.user,
          token: authData.token,
          isAuthenticated: true,
        };
        // APIクライアントが期待する形式でも保存
        if (authData.token?.access_token) {
          localStorage.setItem("access_token", authData.token.access_token);
        }
      }
    } catch (error) {
      console.error("認証情報の読み込みに失敗しました:", error);
      this.clearAuth();
    }
  }

  // 認証情報をローカルストレージに保存
  private saveAuthToStorage(): void {
    try {
      localStorage.setItem("auth", JSON.stringify(this.authState));
      // APIクライアントが期待する形式でも保存
      if (this.authState.token?.access_token) {
        localStorage.setItem("access_token", this.authState.token.access_token);
      }
    } catch (error) {
      console.error("認証情報の保存に失敗しました:", error);
    }
  }

  // 認証情報をクリア
  private clearAuth(): void {
    this.authState = {
      user: null,
      token: null,
      isAuthenticated: false,
    };
    localStorage.removeItem("auth");
    localStorage.removeItem("access_token");
  }

  // サインアップ
  async signUp(data: SignUpRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.signUp(data);
      this.authState = {
        user: response.data.user,
        token: response.data.token,
        isAuthenticated: true,
      };
      this.saveAuthToStorage();
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // サインイン
  async signIn(data: SignInRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.signIn(data);
      this.authState = {
        user: response.data.user,
        token: response.data.token,
        isAuthenticated: true,
      };
      this.saveAuthToStorage();
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // サインアウト
  signOut(): void {
    this.clearAuth();
  }

  // 認証状態を取得
  getAuthState(): AuthState {
    return { ...this.authState };
  }

  // 認証済みかどうか
  isAuthenticated(): boolean {
    return this.authState.isAuthenticated;
  }

  // 現在のユーザーを取得
  getCurrentUser(): AuthResponse["user"] | null {
    console.log("現在のユーザー情報:", this.authState.user);
    return this.authState.user;
  }

  // アクセストークンを取得
  getAccessToken(): string | null {
    return this.authState.token?.access_token || null;
  }
}

// デフォルトの認証サービスインスタンス
export const authService = AuthService.getInstance();
