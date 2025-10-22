import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Store, Menu, MessageSquare, LogOut, Plus } from "lucide-react";
import { authService } from "@/services/auth";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const currentUser = authService.getCurrentUser();

  const handleSignOut = () => {
    authService.signOut();
    window.location.reload();
  };

  const navigation = [
    { name: "レビュー", href: "/reviews", icon: MessageSquare },
    { name: "店舗管理", href: "/stores", icon: Store },
    { name: "サイドメニュー", href: "/side-menus", icon: Menu },
  ];

  const isActive = (path: string) => {
    if (path === "/reviews") {
      return location.pathname === "/" || location.pathname.startsWith("/reviews");
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="w-full px-2 sm:px-4 lg:px-6">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">サイドメニュー研究所</h1>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <span className="hidden sm:inline text-sm text-gray-600">ようこそ、{currentUser?.name}さん</span>
              <Button onClick={handleSignOut} variant="outline" size="sm" className="text-red-600 border-red-600 hover:bg-red-50">
                <LogOut className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">ログアウト</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="w-full px-2 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        <div className="flex flex-col lg:flex-row gap-3 lg:gap-6">
          {/* サイドバー */}
          <aside className="w-full lg:w-56 flex-shrink-0">
            <Card className="p-3">
              <nav className="space-y-2">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link key={item.name} to={item.href} className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive(item.href) ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"}`}>
                      <Icon className="h-4 w-4 mr-3" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>

              {/* クイックアクション */}
              <div className="mt-6 lg:mt-8 pt-4 lg:pt-6 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-900 mb-3">クイックアクション</h3>
                <div className="space-y-2">
                  <Link to="/reviews/new" className="flex items-center px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-md transition-colors">
                    <Plus className="h-4 w-4 mr-3" />
                    新規レビュー作成
                  </Link>
                  <Link to="/stores/new" className="flex items-center px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-md transition-colors">
                    <Plus className="h-4 w-4 mr-3" />
                    新規店舗作成
                  </Link>
                  <Link to="/side-menus/new" className="flex items-center px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-md transition-colors">
                    <Plus className="h-4 w-4 mr-3" />
                    新規メニュー作成
                  </Link>
                </div>
              </div>
            </Card>
          </aside>

          {/* メインコンテンツ */}
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
