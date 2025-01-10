import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useStorage } from "../storage/storage";
import PopUpWindow from "./PopUpWindow";
import { Role } from "../types/Roles";
import { FaEdit, FaTrash } from "react-icons/fa";
import Toast from "./Toast";
import * as houseApi from "../api/rest/house";
import { House } from "../types/House";
import HouseForm from "./HouseForm";
import { Pagination } from "./Pagination";
import Loading from "./Loading";
import { createHouseWebSocket } from "../api/ws/houseWS";
import Filter from "../types/Filter";

const HouseList = () => {
  const [houses, setHouses] = useState<House[]>([]);
  const [showOnlyMine, setShowOnlyMine] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const { getRole, token, login } = useStorage();
  const isAdmin = useMemo(() => getRole() === Role.ADMIN, [getRole]);

  // Add these new state variables
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;
  const [, setIsPageChanging] = useState(false);
  const [sortColumn, setSortColumn] = useState<string>("id");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Replace the single filter state with filters array
  const [filters, setFilters] = useState<Filter[]>([{ column: "id", value: "" }]);

  const handleFilterChange = (index: number, field: 'column' | 'value', newValue: string) => {
    setFilters(prevFilters => {
        const newFilters = [...prevFilters];
        newFilters[index] = {
            ...newFilters[index],
            [field]: newValue
        };
        return newFilters;
    });
  };

  const addFilter = () => {
    setFilters(prev => {
        const existingColumns = new Set(prev.map(f => f.column));
        const allColumns = ["id", "name", "year", "username"];
        const availableColumns = allColumns.filter(col => !existingColumns.has(col));
        
        if (availableColumns.length === 0) {
            setToast({
                message: "Все возможные фильтры уже добавлены",
                type: "error"
            });
            return prev;
        }
        
        return [...prev, { column: availableColumns[0], value: "" }];
    });
  };

  const removeFilter = (index: number) => {
    setFilters(prev => prev.filter((_, i) => i !== index));
  };

  // Update fetchWithFilter to handle multiple filters
  const fetchWithFilter = useCallback(async () => {
    setIsPageChanging(true);
    try {
        // Combine all non-empty filters into a single object
        const filterParams = filters.reduce((acc, filter) => {
            if (filter.value) {
                acc[filter.column] = filter.value;
            }
            return acc;
        }, {} as Record<string, string>);

        const response = await houseApi.fetchWithFilter(
            token,
            filterParams,
            currentPage - 1,
            pageSize,
            sortColumn,
            sortDirection
        );
        
        if (response.status === 200) {
            const { data } = response;
            setHouses(data.content);
            setTotalPages(data.totalPages);
        } else {
            setToast({
                message: response.data.message || "Не удалось получить дома",
                type: "error"
            });
        }
    } catch (error) {
        console.error("Error fetching houses:", error);
        setToast({ message: "Ошибка при загрузке домов", type: "error" });
    } finally {
        setIsLoading(false);
        setIsPageChanging(false);
    }
  }, [token, pageSize, currentPage, sortColumn, sortDirection, filters]);

  useEffect(() => {
    fetchWithFilter();
  }, [fetchWithFilter]);

  const [isPopUpOpen, setIsPopUpOpen] = useState(false);

  const [selectedHouseId, setSelectedHouseId] = useState<number | null>(null);
  const [houseToEdit, setHouseToEdit] = useState<House | null>(null);

  const handleEdit = useCallback(
    (id: number) => {
      setSelectedHouseId(id);
      setHouseToEdit(houses.find((ch) => ch.id === id) ?? null);
      setIsPopUpOpen(true);
    },
    [houses]
  );

  // WebSocket handlers
  const handleHouseUpdate = useCallback((updatedHouse: House) => {
    setHouses(prevHouses => {
      const houseExists = prevHouses.some(house => house.id === updatedHouse.id);
      if (houseExists) {
        return prevHouses.map(house =>
          house.id === updatedHouse.id ? updatedHouse : house
        );
      } else {
        fetchWithFilter();
        return prevHouses;
      }
    });
    setToast({ message: "Дом обновлен", type: "success" });
  }, [fetchWithFilter]);

  const handleHouseCreate = useCallback(() => {
    fetchWithFilter();
  }, [fetchWithFilter]);

  const handleHouseDelete = useCallback(() => {
    fetchWithFilter();
  }, [fetchWithFilter]);

  // Initialize WebSocket connection
  useEffect(() => {
    const client = createHouseWebSocket(
      handleHouseUpdate,
      handleHouseCreate,
      handleHouseDelete
    );

    client.activate();

    return () => {
      if (client.active) {
        client.deactivate();
      }
    };
  }, [handleHouseUpdate, handleHouseCreate, handleHouseDelete]);

  const handleSave = useCallback(
    async (house: House) => {
      if (house.name.trim().length === 0) {
        setToast({
          message: "Название не может быть пустым",
          type: "error",
        });
        return;
      }
      if (house.year < 1 || house.year > 552) {
        setToast({
          message: "Год постройки должен быть от 1 до 552",
          type: "error",
        });
        return;
      }
      if (house.numberOfFlatsOnFloor < 1 || house.numberOfFlatsOnFloor > 1000) {
        setToast({
          message: "Количество квартир на этаже должно быть больше 0",
          type: "error",
        });
        return;
      }

      try {
        if (house.id) {
          const response = await houseApi.updateHouse(token, house);
          if (response.status !== 200) {
            setToast({
              message: response.data.message || "Не удалось обновить дом",
              type: "error",
            });
            return;
          }
          setToast({
            message: "Дом обновлен",
            type: "success",
          });
        } else {
          const response = await houseApi.createHouse(token, house);
          if (response.status !== 200) {
            setToast({
              message: response.data.message || "Не удалось создать дом",
              type: "error",
            });
            return;
          }
          setToast({
            message: "Дом добавлен",
            type: "success",
          });
        }
        setIsPopUpOpen(false);
        fetchWithFilter();
      } catch (error) {
        setToast({
          message: "Произошла ошибка при сохранении",
          type: "error",
        });
      }
    },
    [token, fetchWithFilter]
  );

  const handleDelete = useCallback(
    async (id: number) => {
      const response = await houseApi.deleteHouse(token, id);
      if (response.status !== 200) {
        setToast({
          message: response.data.message || "Не удалось удалить дом",
          type: "error"
        });
        return;
      }
      setToast({
        message: "Дом удален",
        type: "success"
      });
      fetchWithFilter();
    },
    [token, fetchWithFilter]
  );

  const handleSort = useCallback((column: string) => {
    if (sortColumn === column) {
      // Cycle through: asc -> desc -> asc
      setSortDirection(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  }, [sortColumn]);

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col p-4 font-sans">
      <h1 className="text-3xl font-bold text-gray-800 mb-4 text-center">
        Список домов
      </h1>

      <div className="flex-1 bg-gray-50 rounded-xl shadow-lg border border-gray-200 p-6 flex flex-col gap-4">
        <div className="h-[120px] border border-gray-200 rounded-lg p-4 overflow-y-auto">
          {filters.map((filter, index) => (
            <div key={index} className="flex items-center space-x-4 mb-2">
              <select
                value={filter.column}
                onChange={(e) => handleFilterChange(index, 'column', e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors duration-300"
              >
                {["id", "name", "year", "username"]
                  .filter(col => col === filter.column || !filters.some(f => f.column === col))
                  .map(col => (
                    <option key={col} value={col}>
                      {col === "id" ? "ID" :
                       col === "name" ? "Название" :
                       col === "year" ? "Год постройки" :
                       "Пользователь"}
                    </option>
                  ))}
              </select>
              <input
                type="text"
                placeholder={`Поиск по ${filter.column}...`}
                value={filter.value}
                onChange={(e) => handleFilterChange(index, 'value', e.target.value)}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors duration-300"
              />
              {filters.length > 1 && (
                <button
                  onClick={() => removeFilter(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  Удалить
                </button>
              )}
            </div>
          ))}
          <button
            onClick={addFilter}
            className="text-blue-600 hover:text-blue-800"
          >
            + Добавить фильтр
          </button>
        </div>

        <div className="flex items-center justify-between">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={showOnlyMine}
              onChange={(e) => setShowOnlyMine(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-300 peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            <span className="ml-3 text-sm font-medium text-gray-600">
              Показать только мои
            </span>
          </label>

          <button
            onClick={() => {
              setSelectedHouseId(null);
              setHouseToEdit(null);
              setIsPopUpOpen(true);
            }}
            className="text-sm font-medium text-white bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700 transition-all duration-300"
          >
            Добавить новый дом
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-auto rounded-lg border border-gray-200">
            {isLoading ? (
              <Loading />
            ) : (
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-3 whitespace-nowrap">
                      <div className="flex flex-col items-center">
                        <span
                          onClick={() => handleSort("id")}
                          className="cursor-pointer hover:text-blue-600 text-gray-600 font-medium w-48 flex items-center justify-center"
                        >
                          ID {sortColumn === "id" && (sortDirection === "asc" ? "↑" : "↓")}
                        </span>
                      </div>
                    </th>
                    <th className="p-3 whitespace-nowrap">
                      <div className="flex flex-col items-center">
                        <span
                          onClick={() => handleSort("name")}
                          className="cursor-pointer hover:text-blue-600 text-gray-600 font-medium w-48 flex items-center justify-center"
                        >
                          Название {sortColumn === "name" && (sortDirection === "asc" ? "↑" : "↓")}
                        </span>
                      </div>
                    </th>
                    <th className="p-3 whitespace-nowrap">
                      <div className="flex flex-col items-center">
                        <span
                          onClick={() => handleSort("year")}
                          className="cursor-pointer hover:text-blue-600 text-gray-600 font-medium w-48 flex items-center justify-center"
                        >
                          Год постройки {sortColumn === "year" && (sortDirection === "asc" ? "↑" : "↓")}
                        </span>
                      </div>
                    </th>
                    <th className="p-3 whitespace-nowrap">
                      <div className="flex flex-col items-center">
                        <span className="cursor-pointer hover:text-blue-600 text-gray-600 font-medium w-48">
                          Пользователь
                        </span>
                      </div>
                    </th>
                    <th className="p-3 min-w-48"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {houses.map((ch) => (
                    <tr
                      key={ch.id}
                      className="border-b border-gray-200 hover:bg-gray-100 text-center h-16"
                    >
                      <td className="p-3">{ch.id}</td>
                      <td className="p-3">{ch.name}</td>
                      <td className="p-3">{ch.year}</td>
                      <td className="p-3">{ch.user.username}</td>
                      <td className="p-3">
                        <div className="flex justify-center space-x-2">
                          {(isAdmin || login === ch.user.username) && (
                            <>
                              <button
                                onClick={() => handleEdit(ch.id)}
                                className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-md transition-colors duration-300"
                                title="Редактировать"
                              >
                                <FaEdit size={16} />
                              </button>
                              <button
                                onClick={() => handleDelete(ch.id)}
                                className="bg-red-700 hover:bg-red-800 text-white p-2 rounded-md transition-colors duration-300"
                                title="Удалить"
                              >
                                <FaTrash size={16} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="mt-4 flex justify-center">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </div>

      <PopUpWindow isOpen={isPopUpOpen} onClose={() => setIsPopUpOpen(false)}>
        <HouseForm
          id={selectedHouseId}
          setHouseToEdit={setHouseToEdit}
          initialHouse={houseToEdit}
        />
        <div className="flex justify-end space-x-4 mt-4 w-full">
          <button
            onClick={() => {
              if (houseToEdit) {
                handleSave(houseToEdit);
              } else {
                setToast({
                  message: "Некорректные данные дома",
                  type: "error",
                });
              }
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm font-bold w-full uppercase tracking-wider transition-colors duration-300"
          >
            Подтвердить
          </button>
          <button
            onClick={() => setIsPopUpOpen(false)}
            className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-md text-sm font-bold w-full uppercase tracking-wider transition-colors duration-300"
          >
            Отмена
          </button>
        </div>
      </PopUpWindow>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default React.memo(HouseList);
