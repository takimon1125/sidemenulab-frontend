import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // 認証状態をチェック
    const checkAuth = () => {
      const authenticated = authService.isAuthenticated();
      setIsAuthenticated(authenticated);
    };

    checkAuth();
  }, []);

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
  };

  return (
    <Router>
      <Layout isAuthenticated={isAuthenticated}>
        <Routes>
          {/* ログイン不要のルート */}
          <Route path="/" element={<ReviewList />} />
          <Route path="/reviews" element={<ReviewList />} />

          {/* ログイン必須のルート */}
          {isAuthenticated && (
            <>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/stores" element={<StoreList />} />
              <Route path="/stores/new" element={<StoreForm />} />
              <Route path="/stores/:id/edit" element={<StoreForm />} />
              <Route path="/side-menus" element={<SideMenuList />} />
              <Route path="/side-menus/new" element={<SideMenuForm />} />
              <Route path="/side-menus/:id/edit" element={<SideMenuForm />} />
              <Route path="/reviews/new" element={<ReviewForm />} />
            </>
          )}

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
