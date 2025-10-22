import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiClient, Store, StoreCreateRequest, StoreUpdateRequest } from "@/services/api";
import { ArrowLeft, Save, X } from "lucide-react";

export function StoreForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(isEdit);

  useEffect(() => {
    if (isEdit && id) {
      loadStore(parseInt(id));
    }
  }, [isEdit, id]);

  const loadStore = async (storeId: number) => {
    try {
      setInitialLoading(true);
      setError(null);

      // 実際のAPIからデータを取得
      const store = await apiClient.getStore(storeId);

      setFormData({
        name: store.name,
        address: store.address,
        phone: store.phone,
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : "店舗データの読み込みに失敗しました");
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.address.trim() || !formData.phone.trim()) {
      setError("すべての項目を入力してください");
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
        const createData: StoreCreateRequest = {
          name: formData.name,
          address: formData.address,
          phone: formData.phone,
        };
        await apiClient.createStore(createData);
      }

      navigate("/stores");
    } catch (error) {
      setError(error instanceof Error ? error.message : "保存に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/stores");
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
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{isEdit ? "店舗編集" : "新規店舗作成"}</h1>
          <p className="text-gray-600">{isEdit ? "店舗情報を編集します" : "新しい店舗を登録します"}</p>
        </div>
      </div>

      {/* フォーム */}
      <Card>
        <CardHeader>
          <CardTitle>店舗情報</CardTitle>
          <CardDescription>店舗の基本情報を入力してください</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="block text-left font-medium text-gray-700">
                店舗名 <span className="text-red-500">*</span>
              </Label>
              <Input id="name" type="text" placeholder="店舗名を入力してください" value={formData.name} onChange={(e) => handleInputChange("name", e.target.value)} required disabled={loading} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address" className="block text-left font-medium text-gray-700">
                住所 <span className="text-red-500">*</span>
              </Label>
              <Input id="address" type="text" placeholder="住所を入力してください" value={formData.address} onChange={(e) => handleInputChange("address", e.target.value)} required disabled={loading} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="block text-left font-medium text-gray-700">
                電話番号 <span className="text-red-500">*</span>
              </Label>
              <Input id="phone" type="tel" placeholder="電話番号を入力してください" value={formData.phone} onChange={(e) => handleInputChange("phone", e.target.value)} required disabled={loading} />
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
              <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto">
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
