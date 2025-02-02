import React, { useState, useCallback, useMemo, useEffect } from "react";
import { useStorage } from "../storage/storage";
import { Role } from "../types/Roles";
import { Pagination } from "./Pagination";
import Toast from "./Toast";
import * as uploadFileHistoryApi from "../api/rest/uploadFileHistory";
import { UploadFileHistory } from "../types/UploadFileHistory";
import Loading from "./Loading";
import Filter from "../types/Filter";
import { createUploadFileHistoryWebSocket } from "../api/ws/uploadFileHistoryWS";
import { FaDownload } from "react-icons/fa";

const UploadFileHistoryList: React.FC = () => {
    const [uploadFileHistorys, setHistory] = useState<UploadFileHistory[]>([]);
    const [sortColumn, setSortColumn] = useState<string>("id");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
    const [showOnlyMine, setShowOnlyMine] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const pageSize = 10;

    const { getRole, token, login } = useStorage();
    const isAdmin = useMemo(() => getRole() === Role.ADMIN, [getRole]);

    const [isLoading, setIsLoading] = useState(true);
    const [toast, setToast] = useState<{
        message: string;
        type: "success" | "error";
    } | null>(null);

    const [isSaving] = useState(false);
    const [deletingMarineId] = useState<number | null>(null);

    const [isInitialLoading, setIsInitialLoading] = useState(true);

    const [, setIsPageChanging] = useState(false);

    const [filters, setFilters] = useState<Filter[]>([{ column: "id", value: "" }]);

    const fetchWithFilter = useCallback(async () => {
        if (isInitialLoading) {
            setIsLoading(true);
        }
        setIsPageChanging(true);
        try {
            // Combine all non-empty filters into a single object
            const filterParams = filters.reduce((acc, filter) => {
                if (filter.value) {
                    acc[filter.column] = filter.value;
                }
                return acc;
            }, {} as Record<string, string>);

            const response = await uploadFileHistoryApi.fetchWithFilter(
                token,
                filterParams,
                currentPage - 1,
                pageSize,
                sortColumn,
                sortDirection
            );
            
            if (response.status === 200) {
                setHistory(response.data.content);
                setTotalPages(response.data.totalPages);
            } else {
                setToast({
                    message: response.data.message || "Не удалось получить историю загрузки файлов",
                    type: "error"
                });
            }
        } catch (error) {
            console.error("Error fetching upload file historys:", error);
            setToast({ message: "Ошибка при загрузке квартир", type: "error" });
        } finally {
            setIsLoading(false);
            setIsInitialLoading(false);
            setIsPageChanging(false);
        }
    }, [token, currentPage, pageSize, sortColumn, sortDirection, filters, isInitialLoading]);

    const handleDownload = useCallback((id: number, entityName: string) => {
        try {
            if (entityName === "House") {
                uploadFileHistoryApi.donwloadHouseFile(token, id);
            } else if (entityName === "Flat") {
                uploadFileHistoryApi.donwloadFlatFile(token, id);
            }
        } catch (error) {
            console.error("Error downloading file:", error);
            setToast({ message: "Ошибка при загрузке файла", type: "error" });
        }
    }, [token]);

    useEffect(() => {
        fetchWithFilter();
    }, [fetchWithFilter]);

    const handleHistoryItemCreate = useCallback(() => {
        fetchWithFilter();
    }, [fetchWithFilter]);

    // Initialize WebSocket connection
    useEffect(() => {
        const client = createUploadFileHistoryWebSocket(
            handleHistoryItemCreate
        );

        client.activate();

        return () => {
            if (client.active) {
                client.deactivate();
            }
        };
    }, [handleHistoryItemCreate]);

    // Update table rows rendering
    const tableRows = useMemo(() => {
        return uploadFileHistorys.map((historyItem) => (
            <tr key={historyItem.id} className="border-b border-gray-200 hover:bg-gray-100 text-center h-16">
                <td className="p-3">{historyItem.id}</td>
                <td className="p-3">{historyItem.fileName}</td>
                <td className="p-3">{historyItem.entityName}</td>
                <td className="p-3">{historyItem.uploaded}</td>
                <td className="p-3">{historyItem.uploadDate}</td>
                <td className="p-3">{historyItem.status}</td>
                <td className="p-3">{historyItem.errorMessage}</td>
                <td className="p-3">{historyItem.user.username}</td>
                <td className="p-3">
                <div className="flex justify-center space-x-2">
                    <button
                        onClick={() => handleDownload(historyItem.id, historyItem.entityName)}
                        disabled={historyItem.status == "FAILED"}
                        className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-md transition-colors duration-300"
                        title="Скачать"
                    >
                        <FaDownload size={16} />
                    </button>
                </div>
            </td>
            </tr>
        ));
    }, [uploadFileHistorys, isAdmin, login, isSaving, deletingMarineId, handleDownload]);

    // Add handleSort function
    const handleSort = useCallback((column: string) => {
        if (sortColumn === column) {
            // Cycle through: asc -> desc -> asc
            setSortDirection(prev => prev === "asc" ? "desc" : "asc");
        } else {
            setSortColumn(column);
            setSortDirection("asc");
        }
    }, [sortColumn]);

    // Add handler for filter changes
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

    // Add handler to add new filter
    const addFilter = () => {
        setFilters(prev => {
            // Check if all columns are already used
            const existingColumns = new Set(prev.map(f => f.column));
            const allColumns = ["id", "fileName", "entityName", "uploaded", "uploadDate", "status", "errorMessage", "username"];
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

    // Add handler to remove filter
    const removeFilter = (index: number) => {
        setFilters(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <div className="h-[calc(100vh-120px)] flex flex-col p-4 font-sans">
            {/* Header */}
            <h1 className="text-3xl font-bold text-gray-800 mb-4 text-center">
                История загрузки файлов
            </h1>

            {/* Main Container */}
            <div className="flex-1 bg-gray-50 rounded-xl shadow-lg border border-gray-200 p-6 flex flex-col gap-4">
                {/* Filters Section - Fixed height */}
                <div className="h-[120px] border border-gray-200 rounded-lg p-4 overflow-y-auto">
                    {filters.map((filter, index) => (
                        <div key={index} className="flex items-center space-x-4 mb-2">
                            <select
                                value={filter.column}
                                onChange={(e) => handleFilterChange(index, 'column', e.target.value)}
                                className="px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors duration-300"
                            >
                                {["id", "fileName", "entityName", "uploaded", "status", "errorMessage", "username"]
                                    .filter(col => col === filter.column || !filters.some(f => f.column === col))
                                    .map(col => (
                                        <option key={col} value={col}>
                                            {col === "id" ? "ID" :
                                             col === "fileName" ? "Название файла" :
                                             col === "entityName" ? "Название сущности" :
                                             col === "uploaded" ? "Загружено" :
                                             col === "status" ? "Статус" :
                                             col === "errorMessage" ? "Сообщение об ошибке" :
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

                {/* Controls Section */}
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

                </div>

                {/* Table Section - Fills remaining space */}
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
                                                    className="cursor-pointer hover:text-blue-600 text-gray-600 font-medium w-20 flex items-center justify-center"
                                                >
                                                    ID {sortColumn === "id" && (sortDirection === "asc" ? "↑" : "↓")}
                                                </span>
                                            </div>
                                        </th>
                                        <th className="p-3 whitespace-nowrap">
                                            <div className="flex flex-col items-center">
                                                <span
                                                    onClick={() => handleSort("fileName")}
                                                    className="cursor-pointer hover:text-blue-600 text-gray-600 font-medium w-48 flex items-center justify-center"
                                                >
                                                    Название файла {sortColumn === "fileName" && (sortDirection === "asc" ? "↑" : "↓")}
                                                </span>
                                            </div>
                                        </th>
                                        <th className="p-3 whitespace-nowrap">
                                            <div className="flex flex-col items-center">
                                                <span
                                                    onClick={() => handleSort("entityName")}
                                                    className="cursor-pointer hover:text-blue-600 text-gray-600 font-medium w-48 flex items-center justify-center"
                                                >
                                                    Название сущности {sortColumn === "entityName" && (sortDirection === "asc" ? "↑" : "↓")}
                                                </span>
                                            </div>
                                        </th>
                                        <th className="p-3 whitespace-nowrap">
                                            <div className="flex flex-col items-center">
                                                <span
                                                    onClick={() => handleSort("uploaded")}
                                                    className="cursor-pointer hover:text-blue-600 text-gray-600 font-medium w-48 flex items-center justify-center"
                                                >
                                                    Загружено сущностей {sortColumn === "uploaded" && (sortDirection === "asc" ? "↑" : "↓")}
                                                </span>
                                            </div>
                                        </th>
                                        <th className="p-3 whitespace-nowrap">
                                            <div className="flex flex-col items-center">
                                                <span
                                                    onClick={() => handleSort("uploadDate")}
                                                    className="cursor-pointer hover:text-blue-600 text-gray-600 font-medium w-48 flex items-center justify-center"
                                                >
                                                    Дата {sortColumn === "uploadDate" && (sortDirection === "asc" ? "↑" : "↓")}
                                                </span>
                                            </div>
                                        </th>
                                        <th className="p-3 whitespace-nowrap">
                                            <div className="flex flex-col items-center">
                                                <span
                                                    onClick={() => handleSort("status")}
                                                    className="cursor-pointer hover:text-blue-600 text-gray-600 font-medium w-48 flex items-center justify-center"
                                                >
                                                    Статус {sortColumn === "status" && (sortDirection === "asc" ? "↑" : "↓")}
                                                </span>
                                            </div>
                                        </th>
                                        <th className="p-3 whitespace-nowrap">
                                            <div className="flex flex-col items-center">
                                                <span
                                                    onClick={() => handleSort("errorMessage")}
                                                    className="cursor-pointer hover:text-blue-600 text-gray-600 font-medium w-48 flex items-center justify-center"
                                                >
                                                    Сообщение об ошибке {sortColumn === "errorMessage" && (sortDirection === "asc" ? "↑" : "↓")}
                                                </span>
                                            </div>
                                        </th>
                                        <th className="p-3 whitespace-nowrap">
                                            <div className="flex flex-col items-center">
                                                <span
                                                    onClick={() => handleSort("user")}
                                                    className="cursor-pointer hover:text-blue-600 text-gray-600 font-medium w-48 flex items-center justify-center"
                                                >
                                                    Пользователь {sortColumn === "user" && (sortDirection === "asc" ? "↑" : "↓")}
                                                </span>
                                            </div>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {tableRows}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* Pagination - Fixed at bottom */}
                    <div className="mt-4 flex justify-center">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                </div>
            </div>

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

export default UploadFileHistoryList;
