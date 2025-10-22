import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { LoginForm } from "./components/LoginForm";
import { SignupForm } from "./components/SignupForm";
import { HomePage } from "./components/HomePage";
import { Dashboard } from "./pages/Dashboard";
import { StoreList } from "./pages/StoreList";
import { StoreForm } from "./pages/StoreForm";
import { SideMenuList } from "./pages/SideMenuList";
import { SideMenuForm } from "./pages/SideMenuForm";
import { ReviewList } from "./pages/ReviewList";
import { ReviewForm } from "./pages/ReviewForm";
import { Layout } from "./components/Layout";
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

  // 認証済みの場合はメインアプリケーションを表示
  if (isAuthenticated) {
    return (
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<ReviewList />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/stores" element={<StoreList />} />
            <Route path="/stores/new" element={<StoreForm />} />
            <Route path="/stores/:id/edit" element={<StoreForm />} />
            <Route path="/side-menus" element={<SideMenuList />} />
            <Route path="/side-menus/new" element={<SideMenuForm />} />
            <Route path="/side-menus/:id/edit" element={<SideMenuForm />} />
            <Route path="/reviews" element={<ReviewList />} />
            <Route path="/reviews/new" element={<ReviewForm />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </Router>
    );
  }

  // 未認証の場合はログイン/サインアップ画面を表示
  return <>{isLogin ? <LoginForm onToggleMode={toggleMode} onLoginSuccess={handleAuthSuccess} /> : <SignupForm onToggleMode={toggleMode} onSignupSuccess={handleAuthSuccess} />}</>;
}

export default App;
