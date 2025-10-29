import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiClient, type Review, type ReviewComment } from "@/services/api";
import { Star, Heart, MessageSquare, User, Calendar, Edit, Trash2, Send, ArrowLeft, Image as ImageIcon, Upload } from "lucide-react";
import { authService } from "@/services/auth";

export function ReviewDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [review, setReview] = useState<Review | null>(null);
  const [comments, setComments] = useState<ReviewComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  // 編集用のフォーム状態
  const [editForm, setEditForm] = useState({
    title: "",
    comment: "",
    rating: 5,
  });

  // 画像アップロード用の状態
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setIsAuthenticated(authService.isAuthenticated());
  }, []);

  const loadReviewDetail = useCallback(async () => {
    if (!id) {
      setError("レビューIDが指定されていません");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const reviewData = await apiClient.getReview(parseInt(id));
      console.log("取得したレビューデータ:", reviewData);
      console.log("画像データ:", reviewData.images);
      setReview(reviewData);

      // 編集フォームに現在の値を設定
      setEditForm({
        title: reviewData.title || "",
        comment: reviewData.comment || "",
        rating: reviewData.rating,
      });

      // コメントといいね情報を並行して取得
      const [commentsData, likesData] = await Promise.all([
        apiClient.getReviewComments(parseInt(id)).catch((err) => {
          console.warn("Failed to load comments:", err);
          return [];
        }),
        apiClient.getReviewLikes(parseInt(id)).catch((err) => {
          console.warn("Failed to load likes:", err);
          return [];
        }),
      ]);

      setComments(commentsData);
      setLikeCount(likesData.length);

      // ログインユーザーがいいねしているかチェック
      if (isAuthenticated) {
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
          const userLiked = likesData.some((like) => like.user_id === currentUser.id);
          setIsLiked(userLiked);
        }
      }
    } catch (error) {
      console.error("Error loading review detail:", error);
      setError(error instanceof Error ? error.message : "レビューの読み込みに失敗しました");
    } finally {
      setLoading(false);
    }
  }, [id, isAuthenticated]);

  useEffect(() => {
    if (id) {
      loadReviewDetail();
    }
  }, [id, loadReviewDetail]);

  const handleLike = async () => {
    if (!review) return;

    try {
      if (isLiked) {
        await apiClient.unlikeReview(review.id);
        setIsLiked(false);
        setLikeCount((prev) => Math.max(0, prev - 1));
      } else {
        await apiClient.likeReview(review.id);
        setIsLiked(true);
        setLikeCount((prev) => prev + 1);
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes("ログインが必要です")) {
        alert("ログインが必要です");
      } else {
        alert(isLiked ? "いいねの取り消しに失敗しました" : "いいねに失敗しました");
      }
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // フォームを元の値にリセット
    if (review) {
      setEditForm({
        title: review.title || "",
        comment: review.comment || "",
        rating: review.rating,
      });
    }
    setSelectedFiles([]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter((file) => {
      const isValidType = file.type.startsWith("image/");
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB制限
      return isValidType && isValidSize;
    });

    if (validFiles.length !== files.length) {
      alert("画像ファイルは5MB以下のJPG、PNG、GIF形式のみ対応しています");
      return;
    }

    const newFiles = [...selectedFiles, ...validFiles].slice(0, 10); // 最大10枚
    setSelectedFiles(newFiles);
  };

  const handleRemoveSelectedFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const validFiles = files.filter((file) => {
      const isValidType = file.type.startsWith("image/");
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB制限
      return isValidType && isValidSize;
    });

    if (validFiles.length !== files.length) {
      alert("画像ファイルは5MB以下のJPG、PNG、GIF形式のみ対応しています");
      return;
    }

    const newFiles = [...selectedFiles, ...validFiles].slice(0, 10); // 最大10枚
    setSelectedFiles(newFiles);
  };

  const handleSaveEdit = async () => {
    if (!review || saving) return;

    try {
      setSaving(true);

      // レビュー内容を更新
      await apiClient.updateReview(review.id, {
        title: editForm.title,
        comment: editForm.comment,
        rating: editForm.rating,
      });

      // 選択された画像がある場合はアップロード
      if (selectedFiles.length > 0) {
        try {
          await apiClient.uploadReviewImages(review.id, selectedFiles);
          setSelectedFiles([]);
        } catch (error) {
          console.error("画像アップロードエラー:", error);
          alert("レビューは更新されましたが、画像のアップロードに失敗しました");
        }
      }

      // レビュー詳細を再読み込み
      await loadReviewDetail();
      setIsEditing(false);
      alert("レビューを更新しました");
    } catch {
      alert("レビューの更新に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!review) return;

    if (confirm("このレビューを削除しますか？")) {
      try {
        await apiClient.deleteReview(review.id);
        alert("レビューを削除しました");
        navigate("/reviews");
      } catch {
        alert("レビューの削除に失敗しました");
      }
    }
  };

  const handleDeleteImage = async (imageId: number) => {
    if (confirm("この画像を削除しますか？")) {
      try {
        await apiClient.deleteReviewImage(imageId);
        // ローカル状態を更新（レビュー詳細の再読み込みを避ける）
        if (review) {
          const updatedImages = review.images?.filter((img) => img.id !== imageId) || [];
          setReview({ ...review, images: updatedImages });
        }
        alert("画像を削除しました");
      } catch {
        alert("画像の削除に失敗しました");
      }
    }
  };

  const handleSubmitComment = async () => {
    if (!review || !newComment.trim()) return;

    try {
      setSubmittingComment(true);

      const comment = await apiClient.createReviewComment(review.id, {
        content: newComment.trim(),
      });

      setComments((prev) => [comment, ...prev]);
      setNewComment("");
    } catch (error) {
      console.error("Comment submission error:", error);
      if (error instanceof Error && error.message.includes("ログインが必要です")) {
        alert("ログインが必要です");
      } else {
        alert(`コメントの投稿に失敗しました: ${error instanceof Error ? error.message : "不明なエラー"}`);
      }
    } finally {
      setSubmittingComment(false);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => <Star key={i} className={`h-5 w-5 ${i < rating ? "text-yellow-400 fill-current" : "text-gray-300"}`} />);
  };

  const handleDeleteComment = async (commentId: number) => {
    if (confirm("このコメントを削除しますか？")) {
      try {
        await apiClient.deleteReviewComment(commentId);
        setComments((prev) => prev.filter((comment) => comment.id !== commentId));
        alert("コメントを削除しました");
      } catch {
        alert("コメントの削除に失敗しました");
      }
    }
  };

  const isCommentOwner = (comment: ReviewComment) => {
    if (!isAuthenticated) return false;
    const currentUser = authService.getCurrentUser();
    return currentUser && comment.user_id === currentUser.id;
  };

  const isOwner = () => {
    if (!review || !isAuthenticated) return false;
    const currentUser = authService.getCurrentUser();
    return currentUser && review.user_id === currentUser.id;
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

  if (error || !review) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">{error || "レビューが見つかりません"}</p>
        <Button onClick={() => navigate("/reviews")} variant="outline">
          レビュー一覧に戻る
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => navigate("/reviews")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          戻る
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">レビュー詳細</h1>
        </div>
        {isOwner() && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleEdit}>
              <Edit className="h-4 w-4 mr-2" />
              編集
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              削除
            </Button>
          </div>
        )}
      </div>

      {/* レビュー内容 */}
      <Card>
        <CardContent className="p-6">
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">タイトル</Label>
                <Input id="title" value={editForm.title} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditForm((prev) => ({ ...prev, title: e.target.value }))} placeholder="レビューのタイトル" />
              </div>
              <div>
                <Label htmlFor="rating">評価</Label>
                <Select value={editForm.rating.toString()} onValueChange={(value) => setEditForm((prev) => ({ ...prev, rating: parseInt(value) }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5つ星</SelectItem>
                    <SelectItem value="4">4つ星</SelectItem>
                    <SelectItem value="3">3つ星</SelectItem>
                    <SelectItem value="2">2つ星</SelectItem>
                    <SelectItem value="1">1つ星</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="comment">コメント</Label>
                <Textarea id="comment" value={editForm.comment} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditForm((prev) => ({ ...prev, comment: e.target.value }))} placeholder="レビューのコメント" rows={4} />
              </div>

              {/* 画像アップロード機能 */}
              <div>
                <Label>画像管理</Label>

                {/* 既存画像のプレビューと削除 */}
                {review && review.images && review.images.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">既存の画像 ({review.images.length}枚)</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {review.images.map((image, index) => (
                        <div key={image.id} className="relative">
                          <img src={image.image_url} alt={`既存画像 ${index + 1}`} className="w-full h-20 object-cover rounded-lg border border-gray-200" />
                          <button onClick={() => handleDeleteImage(image.id)} disabled={saving} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed" title="画像を削除">
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 新しい画像のアップロード */}
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">新しい画像を追加（最大10枚、各5MB以下）</h4>
                  <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${saving ? "border-gray-200 bg-gray-50 cursor-not-allowed" : "border-gray-300 hover:border-gray-400"}`} onDragOver={saving ? undefined : handleDragOver} onDrop={saving ? undefined : handleDrop}>
                    <input type="file" multiple accept="image/*" onChange={handleFileSelect} disabled={saving} className="hidden" id="image-upload-edit" />
                    <label htmlFor="image-upload-edit" className={`cursor-pointer ${saving ? "cursor-not-allowed opacity-50" : ""}`}>
                      <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600">画像を選択するか、ここにドラッグ&ドロップ</p>
                      <p className="text-xs text-gray-500 mt-1">JPG、PNG、GIF形式、各5MB以下</p>
                    </label>
                  </div>
                </div>

                {/* 選択されたファイルのプレビュー */}
                {selectedFiles.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">追加する画像 ({selectedFiles.length}枚)</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="relative group">
                          <img src={URL.createObjectURL(file)} alt={`プレビュー ${index + 1}`} className="w-full h-24 object-cover rounded-lg border border-gray-200" />
                          <button onClick={() => handleRemoveSelectedFile(index)} disabled={saving} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed" title="削除">
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSaveEdit} disabled={saving} className="bg-green-600 hover:bg-green-700 text-white disabled:bg-gray-400 disabled:cursor-not-allowed">
                  {saving ? "保存中..." : "保存"}
                </Button>
                <Button variant="outline" onClick={handleCancelEdit} disabled={saving} className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 disabled:border-gray-300 disabled:text-gray-400 disabled:cursor-not-allowed">
                  キャンセル
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">{review.title || "タイトルなし"}</h2>
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
                  {review.comment && <p className="text-gray-700 mb-3 whitespace-pre-wrap">{review.comment}</p>}

                  {/* 画像表示 */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-3">
                      <ImageIcon className="h-5 w-5 text-gray-500" />
                      <h3 className="text-lg font-medium text-gray-900">画像 ({review.images ? review.images.length : 0}枚)</h3>
                    </div>

                    {review.images && review.images.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {review.images.map((image, index) => {
                          console.log("画像データ:", image);
                          return (
                            <div key={image.id} className="relative group">
                              <img
                                src={image.image_url}
                                alt={`レビュー画像 ${index + 1}`}
                                className="w-full h-48 object-contain rounded-lg border border-gray-200 bg-gray-100"
                                onLoad={() => {
                                  console.log("画像読み込み成功:", image.image_url);
                                }}
                                onError={(e) => {
                                  console.error("画像読み込みエラー:", image.image_url);
                                  e.currentTarget.style.display = "none";
                                }}
                              />
                              {/* 画像削除ボタン（レビューの所有者のみ表示、編集モード時のみ） */}
                              {isAuthenticated && review.user_id === authService.getCurrentUser()?.id && isEditing && (
                                <button onClick={() => handleDeleteImage(image.id)} className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors" title="画像を削除">
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                        <div className="flex items-center gap-2 text-gray-500">
                          <ImageIcon className="h-5 w-5" />
                          <p className="text-sm">画像はありません</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="font-medium">{review.side_menu_name}</span>
                    <span>@ {review.store_name}</span>
                  </div>
                </div>
                {isAuthenticated && (
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleLike} className={`${isLiked ? "text-red-600 hover:text-red-700 bg-red-50 border-red-200" : "text-gray-600 hover:text-red-600"}`}>
                      <Heart className={`h-4 w-4 mr-1 ${isLiked ? "fill-current" : ""}`} />
                      {isLiked ? "いいね済み" : "いいね"}
                      {likeCount > 0 && <span className="ml-1 text-xs">({likeCount})</span>}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* コメントセクション */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            コメント ({comments.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* コメント投稿フォーム */}
          {isAuthenticated && (
            <div className="space-y-2">
              <Label htmlFor="new-comment">コメントを投稿</Label>
              <div className="flex gap-2">
                <Textarea id="new-comment" value={newComment} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewComment(e.target.value)} placeholder="コメントを入力してください" rows={3} className="flex-1" />
                <Button onClick={handleSubmitComment} disabled={!newComment.trim() || submittingComment} className="self-end">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* コメント一覧 */}
          <div className="space-y-3">
            {comments.length === 0 ? (
              <p className="text-gray-500 text-center py-4">コメントはまだありません</p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="border-l-4 border-blue-200 pl-4 py-2">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <User className="h-4 w-4" />
                      <span className="font-medium">{comment.user?.name || "匿名ユーザー"}</span>
                      <span>•</span>
                      <span>{new Date(comment.created_at).toLocaleDateString("ja-JP")}</span>
                    </div>
                    {isCommentOwner(comment) && (
                      <Button variant="outline" size="sm" onClick={() => handleDeleteComment(comment.id)} className="text-red-600 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <p className="text-gray-800 whitespace-pre-wrap">{comment.comment}</p>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
