import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiClient, DashboardStats, SideMenu, Review } from "@/services/api";
import { Store, Menu, Plus, TrendingUp, MessageSquare } from "lucide-react";

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 実際のAPIからデータを取得
      const [stores, sideMenus, reviews] = await Promise.all([apiClient.getStores(), apiClient.getSideMenus(), apiClient.getReviews()]);

      // 最近追加されたサイドメニュー（最新3件）
      const recentSideMenus = sideMenus.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 3);

      // 最近追加されたレビュー（最新3件）
      const recentReviews = reviews.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 3);

      const stats: DashboardStats = {
        total_stores: stores.length,
        total_side_menus: sideMenus.length,
        total_reviews: reviews.length,
        recent_side_menus: recentSideMenus,
        recent_reviews: recentReviews,
      };

      setStats(stats);
    } catch (error) {
      setError(error instanceof Error ? error.message : "データの読み込みに失敗しました");
    } finally {
      setLoading(false);
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
        <Button onClick={loadDashboardData} variant="outline">
          再試行
        </Button>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* ページヘッダー */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">ダッシュボード</h1>
        <p className="text-gray-600">システムの概要と統計情報</p>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 lg:gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">総店舗数</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_stores}</div>
            <p className="text-xs text-muted-foreground">+2 先月比</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">総サイドメニュー数</CardTitle>
            <Menu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_side_menus}</div>
            <p className="text-xs text-muted-foreground">+8 先月比</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">平均価格</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">¥{stats.recent_side_menus.length > 0 ? Math.round(stats.recent_side_menus.reduce((sum, menu) => sum + menu.price, 0) / stats.recent_side_menus.length) : 0}</div>
            <p className="text-xs text-muted-foreground">最近のメニュー平均</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">総レビュー数</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_reviews}</div>
            <p className="text-xs text-muted-foreground">+3 先月比</p>
          </CardContent>
        </Card>
      </div>

      {/* 最近追加されたレビュー */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>最近追加されたレビュー</CardTitle>
            <CardDescription>最新の3件のレビュー</CardDescription>
          </div>
          <Link to="/reviews">
            <Button variant="outline" size="sm">
              すべて表示
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.recent_reviews.map((review) => (
              <div key={review.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors gap-2 sm:gap-0">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{review.title || "タイトルなし"}</h3>
                  <p className="text-sm text-gray-600">{review.comment}</p>
                  <p className="text-sm text-gray-500">
                    {review.side_menu?.name} @ {review.side_menu?.store?.name}
                  </p>
                </div>
                <div className="flex items-center justify-between sm:flex-col sm:items-end sm:text-right">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }, (_, i) => (
                      <span key={i} className={`text-sm ${i < review.rating ? "text-yellow-400" : "text-gray-300"}`}>
                        ★
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">{new Date(review.created_at).toLocaleDateString("ja-JP")}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 最近追加されたサイドメニュー */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>最近追加されたサイドメニュー</CardTitle>
              <CardDescription>最新の3件のサイドメニュー</CardDescription>
            </div>
            <Link to="/side-menus">
              <Button variant="outline" size="sm">
                すべて表示
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.recent_side_menus.map((menu) => (
              <div key={menu.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors gap-2 sm:gap-0">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{menu.name}</h3>
                  <p className="text-sm text-gray-600">{menu.description}</p>
                  <p className="text-sm text-gray-500">{menu.store?.name}</p>
                </div>
                <div className="flex items-center justify-between sm:flex-col sm:items-end sm:text-right">
                  <p className="font-semibold text-gray-900">¥{menu.price}</p>
                  <p className="text-xs text-gray-500">{new Date(menu.created_at).toLocaleDateString("ja-JP")}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* クイックアクション */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 lg:gap-4">
        <Card>
          <CardHeader>
            <CardTitle>店舗管理</CardTitle>
            <CardDescription>店舗の追加、編集、削除を行います</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Link to="/stores" className="block">
                <Button className="w-full" variant="outline">
                  <Store className="h-4 w-4 mr-2" />
                  店舗一覧を見る
                </Button>
              </Link>
              <Link to="/stores/new" className="block">
                <Button className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  新規店舗を作成
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>レビュー管理</CardTitle>
            <CardDescription>レビューの追加、閲覧を行います</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Link to="/reviews" className="block">
                <Button className="w-full" variant="outline">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  レビュー一覧を見る
                </Button>
              </Link>
              <Link to="/reviews/new" className="block">
                <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  新規レビューを作成
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>サイドメニュー管理</CardTitle>
            <CardDescription>サイドメニューの追加、編集、削除を行います</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Link to="/side-menus" className="block">
                <Button className="w-full" variant="outline">
                  <Menu className="h-4 w-4 mr-2" />
                  メニュー一覧を見る
                </Button>
              </Link>
              <Link to="/side-menus/new" className="block">
                <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  新規メニューを作成
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
