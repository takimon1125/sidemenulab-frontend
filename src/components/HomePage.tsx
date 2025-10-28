import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { authService } from "@/services/auth";
import type { AuthState } from "@/services/auth";

export function HomePage() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
  });

  useEffect(() => {
    const currentAuthState = authService.getAuthState();
    setAuthState(currentAuthState);
  }, []);

  const handleSignOut = () => {
    authService.signOut();
    setAuthState({
      user: null,
      token: null,
      isAuthenticated: false,
    });
    // ログイン画面にリダイレクト
    window.location.reload();
  };

  if (!authState.isAuthenticated || !authState.user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-6">
            <p className="text-center text-gray-600">認証されていません</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent">
      <div className="container mx-auto px-4 py-8">
        {/* ヘッダー */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">ホーム</h1>
            <p className="text-gray-600">ようこそ、{authState.user.name}さん</p>
          </div>
          <Button onClick={handleSignOut} variant="outline" className="text-red-600 border-red-600 hover:bg-red-50">
            ログアウト
          </Button>
        </div>

        {/* メインコンテンツ */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* ユーザー情報カード */}
          <Card>
            <CardHeader>
              <CardTitle>ユーザー情報</CardTitle>
              <CardDescription>あなたのアカウント情報</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <span className="font-medium text-gray-700">名前:</span>
                  <p className="text-gray-900">{authState.user.name}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">メールアドレス:</span>
                  <p className="text-gray-900">{authState.user.email}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">登録日:</span>
                  <p className="text-gray-900">{new Date(authState.user.created_at).toLocaleDateString("ja-JP")}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 統計カード */}
          <Card>
            <CardHeader>
              <CardTitle>統計情報</CardTitle>
              <CardDescription>アカウントの統計</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">1</div>
                  <div className="text-sm text-gray-600">ログイン回数</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{Math.floor((Date.now() - new Date(authState.user.created_at).getTime()) / (1000 * 60 * 60 * 24))}</div>
                  <div className="text-sm text-gray-600">登録からの日数</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* アクションカード */}
          <Card>
            <CardHeader>
              <CardTitle>クイックアクション</CardTitle>
              <CardDescription>よく使用する機能</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button className="w-full" variant="outline">
                  プロフィール編集
                </Button>
                <Button className="w-full" variant="outline">
                  設定
                </Button>
                <Button className="w-full" variant="outline">
                  ヘルプ
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ウェルカムメッセージ */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>🎉 ログイン成功！</CardTitle>
            <CardDescription>バックエンドAPIとの連携が正常に動作しています</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="text-green-600 mr-2">✅</div>
                <div>
                  <p className="text-green-800 font-medium">認証が完了しました</p>
                  <p className="text-green-700 text-sm">JWTトークンが正常に取得され、ユーザー情報が表示されています。</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
