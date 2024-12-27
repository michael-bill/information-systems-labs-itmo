import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { useStorage } from "./storage/storage";
import LoginPage from "./pages/LoginPage";
import MenuPage from "./pages/MenuPage";
import RegisterPage from "./pages/RegisterPage";
import IndexPage from "./pages/IndexPage";

function App() {
  const { token, setToken, reset } = useStorage();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  const validateToken = useCallback(() => {
    if (!token) return false;

    try {
      const { exp } = JSON.parse(atob(token.split(".")[1]));
      return Date.now() < exp * 1000;
    } catch (error) {
      console.error("Error parsing token:", error);
      return false;
    }
  }, [token]);

  useEffect(() => {
    const checkAuthentication = async () => {
      if (validateToken()) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    };

    checkAuthentication();
  }, [validateToken, token, setToken, reset]);


  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 bg-gradient-to-br from-blue-200 to-green-100 opacity-30 z-0" />

      <div className="relative z-10">
        <Router>
          <div className="flex-grow">
            <Routes>
              <Route
                path="/"
                element={
                  isAuthenticated ? (
                    <Navigate to="/panel" replace />
                  ) : (
                    <IndexPage />
                  )
                }
              />
              <Route
                path="/login"
                element={
                  isAuthenticated ? (
                    <Navigate to="/panel" replace />
                  ) : (
                    <LoginPage />
                  )
                }
              />
              <Route
                path="/register"
                element={
                  isAuthenticated ? (
                    <Navigate to="/panel" replace />
                  ) : (
                    <RegisterPage />
                  )
                }
              />
              <Route
                path="/panel"
                element={
                  isAuthenticated ? <MenuPage /> : <Navigate to="/" replace />
                }
              />
              <Route path="*" element={<Navigate to="/panel" replace />} />
            </Routes>
          </div>
        </Router>
      </div>
    </div>
  );
}

export default App;
