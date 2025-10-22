import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { authService } from "@/services/auth";

interface SignupFormProps {
  onToggleMode: () => void;
  onSignupSuccess: () => void;
}

export function SignupForm({ onToggleMode, onSignupSuccess }: SignupFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError("パスワードが一致しません");
      setIsLoading(false);
      return;
    }

    try {
      await authService.signUp({ name, email, password });
      onSignupSuccess();
    } catch (error) {
      setError(error instanceof Error ? error.message : "登録に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">新規登録</CardTitle>
          <CardDescription className="text-center">アカウントを作成してサービスをご利用ください</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="block text-left font-medium text-gray-700">
                お名前
              </Label>
              <Input id="name" type="text" placeholder="お名前を入力してください" value={name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)} required disabled={isLoading} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="block text-left font-medium text-gray-700">
                メールアドレス
              </Label>
              <Input id="email" type="email" placeholder="メールアドレスを入力してください" value={email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} required disabled={isLoading} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="block text-left font-medium text-gray-700">
                パスワード
              </Label>
              <div className="relative">
                <Input id="password" type={showPassword ? "text" : "password"} placeholder="パスワードを入力してください" value={password} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)} required disabled={isLoading} className="pr-10" />
                <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center" onClick={() => setShowPassword(!showPassword)} disabled={isLoading}>
                  {showPassword ? <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" /> : <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="block text-left font-medium text-gray-700">
                パスワード（確認）
              </Label>
              <div className="relative">
                <Input id="confirmPassword" type={showConfirmPassword ? "text" : "password"} placeholder="パスワードを再入力してください" value={confirmPassword} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)} required disabled={isLoading} className="pr-10" />
                <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center" onClick={() => setShowConfirmPassword(!showConfirmPassword)} disabled={isLoading}>
                  {showConfirmPassword ? <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" /> : <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white" disabled={isLoading}>
              {isLoading ? "登録中..." : "新規登録"}
            </Button>
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}
          </form>
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              すでにアカウントをお持ちの方は{" "}
              <button type="button" onClick={onToggleMode} className="text-primary hover:underline cursor-pointer">
                ログイン
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
