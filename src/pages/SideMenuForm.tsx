import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiClient, SideMenu, Store, SideMenuCreateRequest, SideMenuUpdateRequest } from "@/services/api";
import { ArrowLeft, Save, X } from "lucide-react";

export function SideMenuForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    store_id: "",
    name: "",
    description: "",
    price: "",
  });
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    loadStores();
    if (isEdit && id) {
      loadSideMenu(parseInt(id));
    } else {
      setInitialLoading(false);
    }
  }, [isEdit, id]);

  const loadStores = async () => {
    try {
      // 実際のAPIからデータを取得
      const stores = await apiClient.getStores();
      setStores(stores);
    } catch (error) {
      setError("店舗データの読み込みに失敗しました");
    }
  };

  const loadSideMenu = async (menuId: number) => {
    try {
      setInitialLoading(true);
      setError(null);

      // 実際のAPIからデータを取得
      const sideMenu = await apiClient.getSideMenu(menuId);

      setFormData({
        store_id: sideMenu.store_id.toString(),
        name: sideMenu.name,
        description: sideMenu.description,
        price: sideMenu.price.toString(),
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : "サイドメニューデータの読み込みに失敗しました");
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.store_id || !formData.name.trim() || !formData.description.trim() || !formData.price.trim()) {
      setError("すべての項目を入力してください");
      return;
    }

    const price = parseFloat(formData.price);
    if (isNaN(price) || price <= 0) {
      setError("価格は正の数値を入力してください");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (isEdit && id) {
        // API仕様書に更新エンドポイントがないため、更新機能は無効化
        alert("更新機能は現在利用できません");
        return;
      } else {
        const createData: SideMenuCreateRequest = {
          store_id: parseInt(formData.store_id),
          name: formData.name,
          description: formData.description,
          price: price,
        };
        await apiClient.createSideMenu(createData);
      }

      navigate("/side-menus");
    } catch (error) {
      setError(error instanceof Error ? error.message : "保存に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/side-menus");
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* ページヘッダー */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Button variant="outline" onClick={handleCancel} className="w-full sm:w-auto">
          <ArrowLeft className="h-4 w-4 mr-2" />
          戻る
        </Button>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{isEdit ? "サイドメニュー編集" : "新規サイドメニュー作成"}</h1>
          <p className="text-gray-600">{isEdit ? "サイドメニュー情報を編集します" : "新しいサイドメニューを登録します"}</p>
        </div>
      </div>

      {/* フォーム */}
      <Card>
        <CardHeader>
          <CardTitle>サイドメニュー情報</CardTitle>
          <CardDescription>サイドメニューの基本情報を入力してください</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="store_id" className="block text-left font-medium text-gray-700">
                店舗 <span className="text-red-500">*</span>
              </Label>
              <Select value={formData.store_id} onValueChange={(value) => handleInputChange("store_id", value)} disabled={loading}>
                <SelectTrigger>
                  <SelectValue placeholder="店舗を選択してください" />
                </SelectTrigger>
                <SelectContent>
                  {stores.map((store) => (
                    <SelectItem key={store.id} value={store.id.toString()}>
                      {store.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name" className="block text-left font-medium text-gray-700">
                メニュー名 <span className="text-red-500">*</span>
              </Label>
              <Input id="name" type="text" placeholder="メニュー名を入力してください" value={formData.name} onChange={(e) => handleInputChange("name", e.target.value)} required disabled={loading} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="block text-left font-medium text-gray-700">
                説明 <span className="text-red-500">*</span>
              </Label>
              <Input id="description" type="text" placeholder="メニューの説明を入力してください" value={formData.description} onChange={(e) => handleInputChange("description", e.target.value)} required disabled={loading} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price" className="block text-left font-medium text-gray-700">
                価格 <span className="text-red-500">*</span>
              </Label>
              <Input id="price" type="number" placeholder="価格を入力してください" value={formData.price} onChange={(e) => handleInputChange("price", e.target.value)} min="0" step="1" required disabled={loading} />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end space-y-2 sm:space-y-0 sm:space-x-4">
              <Button type="button" variant="outline" onClick={handleCancel} disabled={loading} className="w-full sm:w-auto">
                <X className="h-4 w-4 mr-2" />
                キャンセル
              </Button>
              <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto">
                <Save className="h-4 w-4 mr-2" />
                {loading ? "保存中..." : "保存"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
