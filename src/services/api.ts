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

// 店舗関連の型定義
export interface Store {
  id: number;
  name: string;
  address: string;
  phone: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface StoreCreateRequest {
  name: string;
  address: string;
  phone: string;
}

export interface StoreUpdateRequest {
  name?: string;
  address?: string;
  phone?: string;
}

// サイドメニュー関連の型定義
export interface SideMenu {
  id: number;
  store_id: number;
  name: string;
  description: string;
  price: number;
  store?: Store;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface SideMenuCreateRequest {
  store_id: number;
  name: string;
  description: string;
  price: number;
}

export interface SideMenuUpdateRequest {
  store_id?: number;
  name?: string;
  description?: string;
  price?: number;
}

// レビュー関連の型定義
export interface Review {
  id: number;
  side_menu_id: number;
  side_menu?: SideMenu;
  user_id: number;
  user?: User;
  rating: number;
  title?: string;
  comment?: string;
  is_verified: boolean;
  images?: ReviewImage[];
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface ReviewCreateRequest {
  side_menu_id: number;
  rating: number;
  title?: string;
  comment?: string;
}

export interface ReviewImage {
  id: number;
  review_id: number;
  image_url: string;
  image_order: number;
  created_at: string;
}

export interface ReviewImageCreateRequest {
  image_url: string;
  image_order?: number;
}

export interface ReviewLike {
  id: number;
  review_id: number;
  user_id: number;
  user?: User;
  created_at: string;
}

export interface ReviewComment {
  id: number;
  review_id: number;
  user_id: number;
  user?: User;
  comment: string; // APIレスポンスでは 'comment' フィールド
  created_at: string;
}

// ダッシュボード統計の型定義
export interface DashboardStats {
  total_stores: number;
  total_side_menus: number;
  total_reviews: number;
  recent_side_menus: SideMenu[];
  recent_reviews: Review[];
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
        let errorMessage = "APIリクエストに失敗しました";
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (parseError) {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const responseText = await response.text();
      if (!responseText) {
        throw new Error("空のレスポンスが返されました");
      }

      try {
        return JSON.parse(responseText);
      } catch (parseError) {
        console.error("JSONパースエラー:", parseError);
        console.error("レスポンステキスト:", responseText);
        throw new Error(`JSONパースエラー: ${parseError instanceof Error ? parseError.message : "不明なエラー"}`);
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("ネットワークエラーが発生しました");
    }
  }

  private async authenticatedRequest<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const token = localStorage.getItem("access_token");

    if (!token) {
      throw new Error("ログインが必要です");
    }

    const authHeaders = {
      Authorization: `Bearer ${token}`,
    };

    return this.request<T>(endpoint, {
      ...options,
      headers: {
        ...authHeaders,
        ...options.headers,
      },
    });
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

  // 店舗一覧取得
  async getStores(): Promise<Store[]> {
    const response = await this.authenticatedRequest<{ data: Store[] }>("/stores", {
      method: "GET",
    });
    return response.data;
  }

  // 店舗詳細取得
  async getStore(id: number): Promise<Store> {
    const response = await this.authenticatedRequest<{ data: Store }>(`/stores/${id}`, {
      method: "GET",
    });
    return response.data;
  }

  // 店舗作成
  async createStore(data: StoreCreateRequest): Promise<Store> {
    const response = await this.authenticatedRequest<{ data: Store }>("/stores", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response.data;
  }

  // サイドメニュー一覧取得（ログイン不要 - レビュー表示用）
  async getSideMenus(): Promise<SideMenu[]> {
    const response = await this.request<{ data: SideMenu[] }>("/side-menus", {
      method: "GET",
    });
    return response.data;
  }

  // サイドメニュー詳細取得
  async getSideMenu(id: number): Promise<SideMenu> {
    const response = await this.authenticatedRequest<{ data: SideMenu }>(`/side-menus/${id}`, {
      method: "GET",
    });
    return response.data;
  }

  // 店舗別サイドメニュー一覧取得
  async getSideMenusByStore(storeId: number): Promise<SideMenu[]> {
    const response = await this.authenticatedRequest<{ data: SideMenu[] }>(`/side-menus/store/${storeId}`, {
      method: "GET",
    });
    return response.data;
  }

  // サイドメニュー作成
  async createSideMenu(data: SideMenuCreateRequest): Promise<SideMenu> {
    const response = await this.authenticatedRequest<{ data: SideMenu }>("/side-menus", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response.data;
  }

  // レビュー一覧取得（ログイン不要）
  async getReviews(): Promise<Review[]> {
    const response = await this.request<{ data: Review[] }>("/reviews", {
      method: "GET",
    });
    return response.data;
  }

  // サイドメニュー別レビュー一覧取得
  async getReviewsBySideMenu(sideMenuId: number): Promise<Review[]> {
    const response = await this.authenticatedRequest<{ data: Review[] }>(`/reviews/side-menu/${sideMenuId}`, {
      method: "GET",
    });
    return response.data;
  }

  // レビュー作成
  async createReview(data: ReviewCreateRequest): Promise<Review> {
    const response = await this.authenticatedRequest<{ data: Review }>("/reviews", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response.data;
  }

  // レビュー画像アップロード
  async uploadReviewImage(reviewId: number, data: ReviewImageCreateRequest): Promise<ReviewImage> {
    const response = await this.authenticatedRequest<{ data: ReviewImage }>(`/reviews/${reviewId}/images`, {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response.data;
  }

  // 複数画像アップロード
  async uploadReviewImages(reviewId: number, files: File[]): Promise<ReviewImage[]> {
    const token = localStorage.getItem("access_token");
    if (!token) {
      throw new Error("ログインが必要です");
    }

    const formData = new FormData();
    files.forEach((file) => {
      formData.append("images", file);
    });

    const response = await fetch(`${this.baseUrl}/reviews/${reviewId}/upload-images`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      let errorMessage = "画像アップロードに失敗しました";
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch (parseError) {
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();
    return result.data;
  }

  // レビュー画像一覧取得
  async getReviewImages(reviewId: number): Promise<ReviewImage[]> {
    const response = await this.authenticatedRequest<{ data: ReviewImage[] }>(`/reviews/${reviewId}/images`, {
      method: "GET",
    });
    return response.data;
  }

  // レビューにイイネ
  async likeReview(reviewId: number): Promise<ReviewLike> {
    const response = await this.authenticatedRequest<{ data: ReviewLike }>(`/reviews/${reviewId}/like`, {
      method: "POST",
    });
    return response.data;
  }

  // レビューのイイネ取り消し
  async unlikeReview(reviewId: number): Promise<void> {
    await this.authenticatedRequest<void>(`/reviews/${reviewId}/like`, {
      method: "DELETE",
    });
  }

  // レビューのイイネ一覧取得（認証不要）
  async getReviewLikes(reviewId: number): Promise<ReviewLike[]> {
    const response = await this.request<{ data: ReviewLike[] }>(`/reviews/${reviewId}/likes`, {
      method: "GET",
    });
    return response.data;
  }

  // レビュー詳細取得
  async getReview(reviewId: number): Promise<Review> {
    const response = await this.request<{ data: Review }>(`/reviews/${reviewId}`, {
      method: "GET",
    });
    return response.data;
  }

  // レビュー更新
  async updateReview(reviewId: number, data: { title?: string; comment?: string; rating?: number }): Promise<Review> {
    const response = await this.authenticatedRequest<{ data: Review }>(`/reviews/${reviewId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return response.data;
  }

  // レビュー削除
  async deleteReview(reviewId: number): Promise<void> {
    await this.authenticatedRequest<void>(`/reviews/${reviewId}`, {
      method: "DELETE",
    });
  }

  // レビューコメント一覧取得
  async getReviewComments(reviewId: number): Promise<ReviewComment[]> {
    const response = await this.request<{ data: ReviewComment[] }>(`/review-comments/review/${reviewId}`, {
      method: "GET",
    });
    return response.data;
  }

  // レビューコメント作成
  async createReviewComment(reviewId: number, data: { content: string }): Promise<ReviewComment> {
    const response = await this.authenticatedRequest<{ data: ReviewComment }>("/review-comments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        review_id: reviewId,
        Comment: data.content, // バックエンドが期待するフィールド名
      }),
    });
    return response.data;
  }

  // レビューコメント更新
  async updateReviewComment(commentId: number, data: { content: string }): Promise<ReviewComment> {
    const response = await this.authenticatedRequest<{ data: ReviewComment }>(`/review-comments/${commentId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        Comment: data.content, // バックエンドが期待するフィールド名
      }),
    });
    return response.data;
  }

  // レビューコメント削除
  async deleteReviewComment(commentId: number): Promise<void> {
    await this.authenticatedRequest<void>(`/review-comments/${commentId}`, {
      method: "DELETE",
    });
  }
}

// デフォルトのAPIクライアントインスタンス
export const apiClient = new ApiClient();
