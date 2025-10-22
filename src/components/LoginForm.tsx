import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { authService } from "@/services/auth";

interface LoginFormProps {
  onToggleMode: () => void;
  onLoginSuccess: () => void;
}

export function LoginForm({ onToggleMode, onLoginSuccess }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await authService.signIn({ email, password });
      onLoginSuccess();
    } catch (error) {
      setError(error instanceof Error ? error.message : "ログインに失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="text-center mb-4">
        <p className="text-gray-600">アカウントにログインしてサービスをご利用ください</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
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
        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={isLoading}>
          {isLoading ? "ログイン中..." : "ログイン"}
        </Button>
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}
      </form>
      <div className="mt-6 text-center">
        <p className="text-sm text-muted-foreground">
          アカウントをお持ちでない方は{" "}
          <button type="button" onClick={onToggleMode} className="text-primary hover:underline cursor-pointer">
            新規登録
          </button>
        </p>
      </div>
    </div>
  );
}
