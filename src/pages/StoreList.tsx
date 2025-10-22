import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiClient, Store } from "@/services/api";
import { Plus, Search, Edit, Trash2, Store as StoreIcon } from "lucide-react";

export function StoreList() {
  const [stores, setStores] = useState<Store[]>([]);
  const [filteredStores, setFilteredStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadStores();
  }, []);

  useEffect(() => {
    filterStores();
  }, [stores, searchTerm]);

  const loadStores = async () => {
    try {
      setLoading(true);
      setError(null);

      // 実際のAPIからデータを取得
      const stores = await apiClient.getStores();
      setStores(stores);
    } catch (error) {
      if (error instanceof Error && error.message.includes("ログインが必要です")) {
        alert("ログインが必要です");
        // ログイン画面にリダイレクト
        window.location.href = "/login";
      } else {
        setError(error instanceof Error ? error.message : "店舗データの読み込みに失敗しました");
      }
    } finally {
      setLoading(false);
    }
  };

  const filterStores = () => {
    if (!searchTerm) {
      setFilteredStores(stores);
      return;
    }

    const filtered = stores.filter((store) => store.name.toLowerCase().includes(searchTerm.toLowerCase()) || store.address.toLowerCase().includes(searchTerm.toLowerCase()) || store.phone.includes(searchTerm));
    setFilteredStores(filtered);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("この店舗を削除しますか？")) {
      return;
    }

    try {
      // API仕様書に削除エンドポイントがないため、削除機能は無効化
      alert("削除機能は現在利用できません");
    } catch (error) {
      alert("削除に失敗しました");
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
        <Button onClick={loadStores} variant="outline">
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
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">店舗管理</h1>
          <p className="text-gray-600">店舗の一覧、検索、編集、削除</p>
        </div>
        <Link to="/stores/new">
          <Button className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            新規店舗作成
          </Button>
        </Link>
      </div>

      {/* 検索・フィルター */}
      <Card>
        <CardHeader>
          <CardTitle>検索・フィルター</CardTitle>
          <CardDescription>店舗名、住所、電話番号で検索できます</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input placeholder="店舗名、住所、電話番号で検索..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 店舗一覧 */}
      <Card>
        <CardHeader>
          <CardTitle>店舗一覧</CardTitle>
          <CardDescription>{filteredStores.length}件の店舗が見つかりました</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredStores.length === 0 ? (
            <div className="text-center py-8">
              <StoreIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">店舗が見つかりませんでした</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2 sm:px-4 font-medium text-gray-900">店舗名</th>
                    <th className="text-left py-3 px-2 sm:px-4 font-medium text-gray-900 hidden sm:table-cell">住所</th>
                    <th className="text-left py-3 px-2 sm:px-4 font-medium text-gray-900 hidden md:table-cell">電話番号</th>
                    <th className="text-left py-3 px-2 sm:px-4 font-medium text-gray-900 hidden lg:table-cell">登録日</th>
                    <th className="text-right py-3 px-2 sm:px-4 font-medium text-gray-900">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStores.map((store) => (
                    <tr key={store.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-2 sm:px-4">
                        <div className="font-medium text-gray-900">{store.name}</div>
                        <div className="text-sm text-gray-600 sm:hidden">{store.address}</div>
                        <div className="text-sm text-gray-500 md:hidden">{store.phone}</div>
                      </td>
                      <td className="py-3 px-2 sm:px-4 text-gray-600 hidden sm:table-cell">{store.address}</td>
                      <td className="py-3 px-2 sm:px-4 text-gray-600 hidden md:table-cell">{store.phone}</td>
                      <td className="py-3 px-2 sm:px-4 text-gray-600 hidden lg:table-cell">{new Date(store.created_at).toLocaleDateString("ja-JP")}</td>
                      <td className="py-3 px-2 sm:px-4">
                        <div className="flex items-center justify-end space-x-1 sm:space-x-2">
                          <Link to={`/stores/${store.id}/edit`}>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button variant="outline" size="sm" onClick={() => handleDelete(store.id)} className="text-red-600 hover:text-red-700">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
