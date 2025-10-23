import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiClient, type Review, type SideMenu } from "@/services/api";
import { Plus, Search, Star, Heart, MessageSquare, User, Calendar } from "lucide-react";
import { authService } from "@/services/auth";

export function ReviewList() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [sideMenus, setSideMenus] = useState<SideMenu[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSideMenu, setSelectedSideMenu] = useState<string>("all");
  const [ratingFilter, setRatingFilter] = useState<string>("all");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [reviewLikes, setReviewLikes] = useState<Record<number, number>>({}); // レビューID -> いいね数
  const [userLikedReviews, setUserLikedReviews] = useState<Set<number>>(new Set()); // ユーザーがいいねしたレビューID

  useEffect(() => {
    setIsAuthenticated(authService.isAuthenticated());
  }, []);

  const loadReviewLikes = useCallback(
    async (reviews: Review[]) => {
      try {
        const likesData: Record<number, number> = {};
        const userLikedSet = new Set<number>();

        // 各レビューのいいね数を取得（ログインしていなくても取得）
        for (const review of reviews) {
          try {
            const likes = await apiClient.getReviewLikes(review.id);
            likesData[review.id] = likes.length;

            // ログインしている場合のみ、現在のユーザーがいいねしているかチェック
            if (isAuthenticated) {
              const currentUser = authService.getCurrentUser();
              if (currentUser) {
                const userLiked = likes.some((like) => like.user_id === currentUser.id);
                if (userLiked) {
                  userLikedSet.add(review.id);
                }
              }
            }
          } catch {
            // いいね情報の取得に失敗した場合は0として扱う
            likesData[review.id] = 0;
          }
        }

        setReviewLikes(likesData);
        setUserLikedReviews(userLikedSet);
      } catch (error) {
        console.error("いいね情報の読み込みに失敗しました:", error);
      }
    },
    [isAuthenticated]
  );

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // 実際のAPIからデータを取得（ログイン不要）
      const [reviewsData, sideMenusData] = await Promise.all([apiClient.getReviews(), apiClient.getSideMenus()]);

      setReviews(reviewsData);
      setSideMenus(sideMenusData);

      // 各レビューのいいね数を取得
      await loadReviewLikes(reviewsData);
    } catch (error) {
      setError(error instanceof Error ? error.message : "データの読み込みに失敗しました");
    } finally {
      setLoading(false);
    }
  }, [loadReviewLikes]);

  const filterReviews = useCallback(() => {
    let filtered = [...reviews];

    // 検索フィルター
    if (searchTerm) {
      filtered = filtered.filter((review) => review.title?.toLowerCase().includes(searchTerm.toLowerCase()) || review.comment?.toLowerCase().includes(searchTerm.toLowerCase()) || review.side_menu?.name.toLowerCase().includes(searchTerm.toLowerCase()) || review.user?.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    // サイドメニューフィルター
    if (selectedSideMenu !== "all") {
      filtered = filtered.filter((review) => review.side_menu_id === parseInt(selectedSideMenu));
    }

    // 評価フィルター
    if (ratingFilter !== "all") {
      filtered = filtered.filter((review) => review.rating === parseInt(ratingFilter));
    }

    setFilteredReviews(filtered);
  }, [reviews, searchTerm, selectedSideMenu, ratingFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    filterReviews();
  }, [filterReviews]);

  useEffect(() => {
    // レビューデータが読み込まれたら、ログイン状態に関係なくいいね情報を取得
    if (reviews.length > 0) {
      loadReviewLikes(reviews);
    }
  }, [reviews, loadReviewLikes]);

  useEffect(() => {
    // 認証状態が変更された時にもいいね情報を再読み込み（ユーザーのいいね状態を更新するため）
    if (reviews.length > 0) {
      loadReviewLikes(reviews);
    }
  }, [isAuthenticated, reviews, loadReviewLikes]);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => <Star key={i} className={`h-4 w-4 ${i < rating ? "text-yellow-400 fill-current" : "text-gray-300"}`} />);
  };

  const handleLike = async (reviewId: number) => {
    const isLiked = userLikedReviews.has(reviewId);

    try {
      if (isLiked) {
        // いいねを取り消し
        await apiClient.unlikeReview(reviewId);
        setUserLikedReviews((prev) => {
          const newSet = new Set(prev);
          newSet.delete(reviewId);
          return newSet;
        });
        setReviewLikes((prev) => ({
          ...prev,
          [reviewId]: Math.max(0, (prev[reviewId] || 0) - 1),
        }));
      } else {
        // いいねを追加
        await apiClient.likeReview(reviewId);
        setUserLikedReviews((prev) => new Set(prev).add(reviewId));
        setReviewLikes((prev) => ({
          ...prev,
          [reviewId]: (prev[reviewId] || 0) + 1,
        }));
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes("ログインが必要です")) {
        alert("ログインが必要です");
        // ログイン画面にリダイレクト
        window.location.href = "/login";
      } else {
        alert(isLiked ? "いいねの取り消しに失敗しました" : "いいねに失敗しました");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={loadData} variant="outline">
          再試行
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* ページヘッダー */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">レビュー一覧</h1>
          <p className="text-gray-600">サイドメニューのレビューを確認できます</p>
        </div>
        {isAuthenticated && (
          <Link to="/reviews/new">
            <Button className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              新規レビュー作成
            </Button>
          </Link>
        )}
      </div>

      {/* 検索・フィルター */}
      <Card>
        <CardHeader>
          <CardTitle>検索・フィルター</CardTitle>
          <CardDescription>レビューのタイトル、コメント、サイドメニュー名で検索し、サイドメニューや評価でフィルタリングできます</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative sm:col-span-2 lg:col-span-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input placeholder="レビューで検索..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
            </div>

            <Select value={selectedSideMenu} onValueChange={setSelectedSideMenu}>
              <SelectTrigger>
                <SelectValue placeholder="サイドメニューを選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべてのサイドメニュー</SelectItem>
                {sideMenus.map((sideMenu) => (
                  <SelectItem key={sideMenu.id} value={sideMenu.id.toString()}>
                    {sideMenu.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={ratingFilter} onValueChange={setRatingFilter}>
              <SelectTrigger>
                <SelectValue placeholder="評価を選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべての評価</SelectItem>
                <SelectItem value="5">5つ星</SelectItem>
                <SelectItem value="4">4つ星</SelectItem>
                <SelectItem value="3">3つ星</SelectItem>
                <SelectItem value="2">2つ星</SelectItem>
                <SelectItem value="1">1つ星</SelectItem>
              </SelectContent>
            </Select>

            <div className="text-sm text-gray-600 flex items-center justify-center sm:justify-start">{filteredReviews.length}件のレビューが見つかりました</div>
          </div>
        </CardContent>
      </Card>

      {/* レビュー一覧 */}
      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">レビューが見つかりませんでした</p>
          </div>
        ) : (
          filteredReviews.map((review) => (
            <Card key={review.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg text-gray-900">{review.title || "タイトルなし"}</h3>
                      {review.is_verified && <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">購入確認済み</span>}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {review.user?.name || "匿名ユーザー"}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(review.created_at).toLocaleDateString("ja-JP")}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center gap-1">{renderStars(review.rating)}</div>
                      <span className="text-sm text-gray-600">{review.rating}/5</span>
                    </div>
                    {review.comment && <p className="text-gray-700 mb-3">{review.comment}</p>}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="font-medium">{review.side_menu?.name}</span>
                      <span>¥{review.side_menu?.price}</span>
                      <span>@ {review.side_menu?.store?.name}</span>
                      {reviewLikes[review.id] > 0 && (
                        <span className="flex items-center gap-1 text-red-600">
                          <Heart className="h-3 w-3" />
                          {reviewLikes[review.id]}
                        </span>
                      )}
                    </div>
                  </div>
                  {isAuthenticated && (
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleLike(review.id)} className={`${userLikedReviews.has(review.id) ? "text-red-600 hover:text-red-700 bg-red-50 border-red-200" : "text-gray-600 hover:text-red-600"}`}>
                        <Heart className={`h-4 w-4 mr-1 ${userLikedReviews.has(review.id) ? "fill-current" : ""}`} />
                        {userLikedReviews.has(review.id) ? "いいね済み" : "いいね"}
                        {reviewLikes[review.id] > 0 && <span className="ml-1 text-xs">({reviewLikes[review.id]})</span>}
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
