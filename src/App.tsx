import { useState, useEffect } from "react";
import { LoginForm } from "./components/LoginForm";
import { SignupForm } from "./components/SignupForm";
import { HomePage } from "./components/HomePage";
import { authService } from "./services/auth";
import "./App.css";

function App() {
  const [isLogin, setIsLogin] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // 認証状態をチェック
    const checkAuth = () => {
      const authenticated = authService.isAuthenticated();
      setIsAuthenticated(authenticated);
    };

    checkAuth();
  }, []);

  const toggleMode = () => {
    setIsLogin(!isLogin);
  };

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
  };

  // 認証済みの場合はホーム画面を表示
  if (isAuthenticated) {
    return <HomePage />;
  }

  // 未認証の場合はログイン/サインアップ画面を表示
  return <>{isLogin ? <LoginForm onToggleMode={toggleMode} onLoginSuccess={handleAuthSuccess} /> : <SignupForm onToggleMode={toggleMode} onSignupSuccess={handleAuthSuccess} />}</>;
}

export default App;
