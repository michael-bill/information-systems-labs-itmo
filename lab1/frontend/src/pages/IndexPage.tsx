import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const IndexPage = () => {
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Content Container - adjusted padding and width */}
      <div className="relative z-10 bg-white shadow-2xl rounded-3xl p-6 md:p-12 max-w-2xl w-full">
        {/* Title and Subtitle - adjusted spacing */}
        <div className="text-center mb-6 md:mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            House Control Panel
          </h1>
          <p className="text-base md:text-lg text-gray-600">
            Управление вашим домом
          </p>
        </div>

        {/* Buttons - adjusted for equal widths */}
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 justify-center">
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.15)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleNavigation("/login")}
            className="py-4 px-8 rounded-lg text-xl font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 w-full md:w-64"
          >
            Войти
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.15)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleNavigation("/register")}
            className="py-4 px-8 rounded-lg text-xl font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-300 w-full md:w-64"
          >
            Зарегистрироваться
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default IndexPage;