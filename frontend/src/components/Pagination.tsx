import React from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const pageNumbers = [];
  for (
    let i = Math.max(1, currentPage - 2);
    i <= Math.min(totalPages, currentPage + 2);
    i++
  ) {
    pageNumbers.push(i);
  }

  return (
    <nav className="flex items-center justify-center mt-6">
      <ul className="flex items-center gap-2">
        <li>
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex items-center justify-center w-10 h-10 rounded-lg border-2 border-gray-300 bg-white text-gray-500 hover:bg-gray-50 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            aria-label="Previous page"
          >
            <FaChevronLeft className="w-4 h-4" />
          </button>
        </li>

        {currentPage > 3 && (
          <>
            <li>
              <button
                onClick={() => onPageChange(1)}
                className="flex items-center justify-center w-10 h-10 rounded-lg border-2 border-gray-300 bg-white text-gray-700 hover:border-blue-500 hover:text-blue-600 transition-all duration-200"
              >
                1
              </button>
            </li>
            <li className="text-gray-400">...</li>
          </>
        )}

        {pageNumbers.map((number) => (
          <li key={number}>
            <button
              onClick={() => onPageChange(number)}
              className={`flex items-center justify-center w-10 h-10 rounded-lg border-2 transition-all duration-200
                ${currentPage === number
                  ? "border-blue-500 bg-blue-50 text-blue-600 font-medium"
                  : "border-gray-300 bg-white text-gray-700 hover:border-blue-500 hover:text-blue-600"
                }`}
            >
              {number}
            </button>
          </li>
        ))}

        {currentPage < totalPages - 2 && (
          <>
            <li className="text-gray-400">...</li>
            <li>
              <button
                onClick={() => onPageChange(totalPages)}
                className="flex items-center justify-center w-10 h-10 rounded-lg border-2 border-gray-300 bg-white text-gray-700 hover:border-blue-500 hover:text-blue-600 transition-all duration-200"
              >
                {totalPages}
              </button>
            </li>
          </>
        )}

        <li>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="flex items-center justify-center w-10 h-10 rounded-lg border-2 border-gray-300 bg-white text-gray-500 hover:bg-gray-50 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            aria-label="Next page"
          >
            <FaChevronRight className="w-4 h-4" />
          </button>
        </li>
      </ul>
    </nav>
  );
};
