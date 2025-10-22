import { useState } from "react";
import { LoginForm } from "./components/LoginForm";
import { SignupForm } from "./components/SignupForm";
import "./App.css";

function App() {
  const [isLogin, setIsLogin] = useState(true);

  const toggleMode = () => {
    setIsLogin(!isLogin);
  };

  return <>{isLogin ? <LoginForm onToggleMode={toggleMode} /> : <SignupForm onToggleMode={toggleMode} />}</>;
}

export default App;
