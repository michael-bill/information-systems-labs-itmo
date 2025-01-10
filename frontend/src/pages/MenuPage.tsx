import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SideBar from "../components/SideBar";
import { MenuState } from "../types/MenuState";
import Admin from "../components/view/Admin";
import Dashboard from "../components/view/Dashboard";
import SpaceMap from "../components/view/FlatMap";
import { useStorage } from "../storage/storage";
import Flats from "../components/view/Flats";
import Houses from "../components/view/Houses";
import UploadFileHistoryV from "../components/view/UploadFileHistory";

const MenuPage: React.FC = () => {
  const { currentMenuState, setCurrentMenuState } = useStorage();

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const renderContent = () => {
    switch (currentMenuState) {
      case MenuState.Flat:
        return <Flats />;
      case MenuState.House:
        return <Houses />;
      case MenuState.Admin:
        return <Admin />;
      case MenuState.Map:
        return <SpaceMap />;
      case MenuState.UploadFileHistory:
        return <UploadFileHistoryV />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SideBar setState={setCurrentMenuState} />
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentMenuState}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.3 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default MenuPage;
