import React from "react";
import { motion } from "framer-motion";
import { MenuState } from "../types/MenuState";
import {
  RiDashboardLine,
  RiHomeSmileLine,
  RiBuilding4Line,
  RiAdminLine,
  RiMapPinLine,
  RiLogoutBoxLine
} from "react-icons/ri";
import { useStorage } from "../storage/storage";

interface SideBarProps {
  setState: (state: MenuState) => void;
}

const SideBar: React.FC<SideBarProps> = ({ setState }) => {
  const { reset } = useStorage();
  const menuItems = [
    {
      name: "Панель",
      state: MenuState.Dashboard,
      icon: RiDashboardLine,
    },
    {
      name: "Квартиры",
      state: MenuState.Flat,
      icon: RiHomeSmileLine,
    },
    { 
      name: "Дома", 
      state: MenuState.House, 
      icon: RiBuilding4Line 
    },
    { 
      name: "Админ", 
      state: MenuState.Admin, 
      icon: RiAdminLine 
    },
    { 
      name: "Карта", 
      state: MenuState.Map, 
      icon: RiMapPinLine 
    },
  ];

  return (
    <motion.div
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-gray-800 p-3 flex items-center justify-between bg-white shadow-lg z-[20] w-full"
    >
      <div className="flex items-center gap-8">
        <h1 className="text-lg font-bold px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-400 text-white rounded-lg">
          Панель управления
        </h1>
        <nav>
          <ul className="flex gap-2">
            {menuItems.map((item, index) => (
              <motion.li
                key={item.name}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <button
                  onClick={() => setState(item.state)}
                  className="px-4 py-2 rounded-lg transition-all duration-300 hover:bg-blue-50 flex items-center group relative overflow-hidden"
                >
                  <div className="absolute inset-x-0 bottom-0 h-1 bg-blue-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                  {item.icon && (
                    <item.icon className="mr-2 text-lg text-gray-400 group-hover:text-blue-500" />
                  )}
                  <span className="text-sm font-medium text-gray-600 group-hover:text-blue-600">
                    {item.name}
                  </span>
                </button>
              </motion.li>
            ))}
          </ul>
        </nav>
      </div>
      <button
        onClick={reset}
        className="flex items-center gap-2 text-sm font-medium text-red-500 hover:text-red-600 px-4 py-2 rounded-lg transition-colors duration-300"
      >
        <RiLogoutBoxLine className="text-lg" />
        <span>Выйти</span>
      </button>
    </motion.div>
  );
};

export default SideBar;
