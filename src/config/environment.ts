// 環境設定
export const config = {
  // APIのベースURL
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1",

  // デバッグモード
  debugMode: import.meta.env.VITE_DEBUG_MODE === "true" || import.meta.env.DEV,

  // 環境情報
  isProduction: import.meta.env.PROD,
  isDevelopment: import.meta.env.DEV,

  // アプリケーション情報
  appName: "サイドメニューラボ",
  appVersion: import.meta.env.VITE_APP_VERSION || "1.0.0",
};

// ログ出力（デバッグモード時のみ）
export const debugLog = (...args: unknown[]) => {
  if (config.debugMode) {
    console.log("[DEBUG]", ...args);
  }
};

// 環境情報をコンソールに出力
if (config.debugMode) {
  console.log("環境設定:", {
    apiBaseUrl: config.apiBaseUrl,
    debugMode: config.debugMode,
    isProduction: config.isProduction,
    isDevelopment: config.isDevelopment,
    appName: config.appName,
    appVersion: config.appVersion,
  });
}
