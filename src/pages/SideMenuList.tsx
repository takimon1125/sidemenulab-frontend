import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiClient, SideMenu, Store } from "@/services/api";
import { Plus, Search, Edit, Trash2, Menu as MenuIcon, Store as StoreIcon } from "lucide-react";

export function SideMenuList() {
  const [sideMenus, setSideMenus] = useState<SideMenu[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [filteredMenus, setFilteredMenus] = useState<SideMenu[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStore, setSelectedStore] = useState<string>("all");
  const [priceRange, setPriceRange] = useState<string>("all");

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterMenus();
  }, [sideMenus, searchTerm, selectedStore, priceRange]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 実際のAPIからデータを取得
      const [storesData, sideMenusData] = await Promise.all([apiClient.getStores(), apiClient.getSideMenus()]);

      setStores(storesData);
      setSideMenus(sideMenusData);
    } catch (error) {
      setError(error instanceof Error ? error.message : "データの読み込みに失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const filterMenus = () => {
    let filtered = [...sideMenus];

    // 検索フィルター
    if (searchTerm) {
      filtered = filtered.filter((menu) => menu.name.toLowerCase().includes(searchTerm.toLowerCase()) || menu.description.toLowerCase().includes(searchTerm.toLowerCase()) || menu.store?.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    // 店舗フィルター
    if (selectedStore !== "all") {
      filtered = filtered.filter((menu) => menu.store_id === parseInt(selectedStore));
    }

    // 価格帯フィルター
    if (priceRange !== "all") {
      switch (priceRange) {
        case "under200":
          filtered = filtered.filter((menu) => menu.price < 200);
          break;
        case "200-300":
          filtered = filtered.filter((menu) => menu.price >= 200 && menu.price <= 300);
          break;
        case "300-400":
          filtered = filtered.filter((menu) => menu.price >= 300 && menu.price <= 400);
          break;
        case "over400":
          filtered = filtered.filter((menu) => menu.price > 400);
          break;
      }
    }

    setFilteredMenus(filtered);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("このサイドメニューを削除しますか？")) {
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
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">サイドメニュー管理</h1>
          <p className="text-gray-600">サイドメニューの一覧、検索、編集、削除</p>
        </div>
        <Link to="/side-menus/new">
          <Button className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            新規メニュー作成
          </Button>
        </Link>
      </div>

      {/* 検索・フィルター */}
      <Card>
        <CardHeader>
          <CardTitle>検索・フィルター</CardTitle>
          <CardDescription>メニュー名、説明、店舗名で検索し、店舗や価格帯でフィルタリングできます</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative sm:col-span-2 lg:col-span-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input placeholder="メニュー名、説明で検索..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
            </div>

            <Select value={selectedStore} onValueChange={setSelectedStore}>
              <SelectTrigger>
                <SelectValue placeholder="店舗を選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべての店舗</SelectItem>
                {stores.map((store) => (
                  <SelectItem key={store.id} value={store.id.toString()}>
                    {store.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={priceRange} onValueChange={setPriceRange}>
              <SelectTrigger>
                <SelectValue placeholder="価格帯を選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべての価格</SelectItem>
                <SelectItem value="under200">200円未満</SelectItem>
                <SelectItem value="200-300">200円〜300円</SelectItem>
                <SelectItem value="300-400">300円〜400円</SelectItem>
                <SelectItem value="over400">400円超</SelectItem>
              </SelectContent>
            </Select>

            <div className="text-sm text-gray-600 flex items-center justify-center sm:justify-start">{filteredMenus.length}件のメニューが見つかりました</div>
          </div>
        </CardContent>
      </Card>

      {/* サイドメニュー一覧 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-4">
        {filteredMenus.length === 0 ? (
          <div className="col-span-full text-center py-8">
            <MenuIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">サイドメニューが見つかりませんでした</p>
          </div>
        ) : (
          filteredMenus.map((menu) => (
            <Card key={menu.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{menu.name}</CardTitle>
                    <CardDescription className="mt-1">
                      <div className="flex items-center text-sm text-gray-600">
                        <StoreIcon className="h-4 w-4 mr-1" />
                        {menu.store?.name}
                      </div>
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Link to={`/side-menus/${menu.id}/edit`}>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(menu.id)} className="text-red-600 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm mb-3">{menu.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-blue-600">¥{menu.price}</span>
                  <span className="text-xs text-gray-500">{new Date(menu.created_at).toLocaleDateString("ja-JP")}</span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
