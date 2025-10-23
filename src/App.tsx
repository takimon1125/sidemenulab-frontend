import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Dashboard } from "./pages/Dashboard";
import { ReviewList } from "./pages/ReviewList";
import { ReviewDetail } from "./pages/ReviewDetail";
import { ReviewForm } from "./pages/ReviewForm";
import { LikedReviews } from "./pages/LikedReviews";
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
          <Route path="/reviews/:id" element={<ReviewDetail />} />

          {/* ログイン必須のルート */}
          {isAuthenticated && (
            <>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/reviews/new" element={<ReviewForm />} />
              <Route path="/reviews/liked" element={<LikedReviews />} />
            </>
          )}

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
