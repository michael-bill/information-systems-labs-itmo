import React, { useState } from "react";
import { motion } from "framer-motion";
import Toast from "../components/Toast";
import { useNavigate, Link } from "react-router-dom";
import { register } from "../api/rest/auth";

const RegisterPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setToast({ message: "Пароли не совпадают, проверьте ввод!", type: "error" });
      return;
    }

    const response = await register(username, password);
    switch (response.status) {
      case 200:
        setToast({
          message: "Регистрация прошла успешно! Перенаправление на страницу входа...",
          type: "success",
        });
        setTimeout(() => {
          navigate("/login");
        }, 1000);
        break;
      case 400:
        setToast({
          message: response.data.message,
          type: "error",
        });
        break;
      default:
        setToast({
          message: "Что-то пошло не так, попробуйте позже!",
          type: "error",
        });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 bg-white shadow-2xl rounded-3xl p-8 md:p-16 max-w-3xl w-full"
      >
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-2xl md:text-5xl font-bold text-gray-800 mb-3">
            Регистрация нового аккаунта
          </h1>
          <p className="text-lg text-gray-600">
            Создайте ваш аккаунт SmartHome Control
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700"
            >
              Логин
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="block w-full px-3 py-3 bg-white border border-gray-300 rounded-md text-sm shadow-sm
                focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Пароль
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full px-3 py-3 bg-white border border-gray-300 rounded-md text-sm shadow-sm
                focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700"
            >
              Подтвердите пароль
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="block w-full px-3 py-3 bg-white border border-gray-300 rounded-md text-sm shadow-sm
                focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>

          <div className="flex flex-col space-y-4">
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.15)" }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="py-4 px-12 rounded-lg text-lg font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-300"
            >
              Зарегистрироваться
            </motion.button>
            <Link to="/" className="w-full">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.15)" }}
                whileTap={{ scale: 0.95 }}
                className="w-full py-4 px-12 rounded-lg text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300"
              >
                На главную
              </motion.button>
            </Link>
          </div>
        </form>
      </motion.div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default RegisterPage;
