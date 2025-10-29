import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiClient } from "@/services/api";
import type { ReviewCreateRequest } from "@/services/api";
import { authService } from "@/services/auth";
import { ArrowLeft, Save, X, Star, Upload, Trash2 } from "lucide-react";

export function ReviewForm() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    store_name: "",
    side_menu_name: "",
    rating: "5",
    title: "",
    comment: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter((file) => {
      const isValidType = file.type.startsWith("image/");
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB制限
      return isValidType && isValidSize;
    });

    if (validFiles.length !== files.length) {
      setError("画像ファイルは5MB以下のJPG、PNG、GIF形式のみ対応しています");
      return;
    }

    const newImages = [...selectedImages, ...validFiles].slice(0, 10); // 最大10枚
    setSelectedImages(newImages);

    // プレビュー画像を生成
    const newPreviews = newImages.map((file) => URL.createObjectURL(file));
    setImagePreviews(newPreviews);
  };

  const removeImage = (index: number) => {
    const newImages = selectedImages.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);

    // 削除されたプレビューのURLを解放
    URL.revokeObjectURL(imagePreviews[index]);

    setSelectedImages(newImages);
    setImagePreviews(newPreviews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.store_name || !formData.side_menu_name || !formData.rating) {
      setError("店舗名、サイドメニュー名、評価は必須です");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // 現在のユーザー情報を確認
      const currentUser = authService.getCurrentUser();
      console.log("レビュー作成時のユーザー情報:", currentUser);
      console.log("アクセストークン:", authService.getAccessToken());

      // レビューを作成
      const createData: ReviewCreateRequest = {
        store_name: formData.store_name,
        side_menu_name: formData.side_menu_name,
        rating: parseInt(formData.rating),
        title: formData.title || undefined,
        comment: formData.comment || undefined,
      };
      console.log("レビュー作成データ:", createData);
      const review = await apiClient.createReview(createData);

      // 画像をアップロード
      if (selectedImages.length > 0) {
        await apiClient.uploadReviewImages(review.id, selectedImages);
      }

      navigate("/reviews");
    } catch (error) {
      if (error instanceof Error && error.message.includes("ログインが必要です")) {
        alert("ログインが必要です");
        // ログイン画面にリダイレクト
        window.location.href = "/login";
      } else {
        setError(error instanceof Error ? error.message : "保存に失敗しました");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/reviews");
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <button key={i} type="button" onClick={() => handleInputChange("rating", (i + 1).toString())} className={`h-8 w-8 ${i < rating ? "text-yellow-400 fill-current" : "text-gray-300"} hover:text-yellow-400 transition-colors`}>
        <Star className="h-full w-full" />
      </button>
    ));
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* ページヘッダー */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Button variant="outline" onClick={handleCancel} className="w-full sm:w-auto">
          <ArrowLeft className="h-4 w-4 mr-2" />
          戻る
        </Button>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">新規レビュー作成</h1>
          <p className="text-gray-600">サイドメニューのレビューを投稿します</p>
        </div>
      </div>

      {/* フォーム */}
      <Card>
        <CardHeader>
          <CardTitle>レビュー情報</CardTitle>
          <CardDescription>サイドメニューのレビュー情報を入力してください</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="store_name" className="block text-left font-medium text-gray-700">
                店舗名 <span className="text-red-500">*</span>
              </Label>
              <Input id="store_name" type="text" placeholder="店舗名を入力してください" value={formData.store_name} onChange={(e) => handleInputChange("store_name", e.target.value)} disabled={loading} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="side_menu_name" className="block text-left font-medium text-gray-700">
                サイドメニュー名 <span className="text-red-500">*</span>
              </Label>
              <Input id="side_menu_name" type="text" placeholder="サイドメニュー名を入力してください" value={formData.side_menu_name} onChange={(e) => handleInputChange("side_menu_name", e.target.value)} disabled={loading} />
            </div>

            <div className="space-y-2">
              <Label className="block text-left font-medium text-gray-700">
                評価 <span className="text-red-500">*</span>
              </Label>
              <div className="flex items-center gap-2">
                {renderStars(parseInt(formData.rating))}
                <span className="text-sm text-gray-600 ml-2">{formData.rating}/5</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title" className="block text-left font-medium text-gray-700">
                タイトル
              </Label>
              <Input id="title" type="text" placeholder="レビューのタイトルを入力してください" value={formData.title} onChange={(e) => handleInputChange("title", e.target.value)} disabled={loading} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="comment" className="block text-left font-medium text-gray-700">
                コメント
              </Label>
              <textarea
                id="comment"
                placeholder="レビューのコメントを入力してください"
                value={formData.comment}
                onChange={(e) => handleInputChange("comment", e.target.value)}
                disabled={loading}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed placeholder:text-gray-400"
              />
            </div>

            <div className="space-y-2">
              <Label className="block text-left font-medium text-gray-700">画像（最大10枚、各5MB以下）</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                <input type="file" multiple accept="image/*" onChange={handleImageSelect} disabled={loading} className="hidden" id="image-upload" />
                <label htmlFor="image-upload" className="cursor-pointer">
                  <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">画像を選択するか、ここにドラッグ&ドロップ</p>
                  <p className="text-xs text-gray-500 mt-1">JPG、PNG、GIF形式、各5MB以下</p>
                </label>
              </div>

              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img src={preview} alt={`プレビュー ${index + 1}`} className="w-full h-24 object-cover rounded-lg border border-gray-200" />
                      <button type="button" onClick={() => removeImage(index)} disabled={loading} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
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
              <Button type="submit" disabled={loading} className="bg-purple-600 hover:bg-purple-700 text-white w-full sm:w-auto">
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
