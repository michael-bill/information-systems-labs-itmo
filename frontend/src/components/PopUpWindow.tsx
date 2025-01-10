import { motion, AnimatePresence } from "framer-motion";
import React, { ReactNode } from "react";
import { createPortal } from "react-dom";

interface PopUpWindowProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

const PopUpWindow: React.FC<PopUpWindowProps> = ({
  isOpen,
  onClose,
  children,
}) => {
  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 flex justify-center items-center z-50">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-black bg-opacity-70 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{
              duration: 0.3,
              type: "spring",
              stiffness: 300,
              damping: 30,
            }}
            className="relative bg-white rounded-lg p-6 w-11/12 max-w-2xl max-h-[90vh] overflow-auto border-2 border-white/10 z-[90]"
          >
            <button
              onClick={onClose}
              className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors duration-200"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <div className="mt-4">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default PopUpWindow;
