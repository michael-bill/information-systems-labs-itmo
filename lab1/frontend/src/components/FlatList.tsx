import React, { useState, useCallback, useMemo, useEffect } from "react";
import { useStorage } from "../storage/storage";
import PopUpWindow from "./PopUpWindow";
import { Flat } from "../types/Flat";
import { Role } from "../types/Roles";
import { Pagination } from "./Pagination";
import { FaEdit, FaTrash } from "react-icons/fa";
import Toast from "./Toast";
import FlatForm from "./FlatForm";
import { createFlat, deleteFlat, fetchFlatsWithPagination, updateFlat } from "../api/rest/flat";
import { FlatDTO } from "../types/FlatDTO";
import Loading from "./Loading";
import { createFlatWebSocket } from "../api/ws/flatWS";

const FlatList: React.FC = () => {
    const [flats, setFlats] = useState<Flat[]>([]);
    const [sortColumn, setSortColumn] = useState<string>("id");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
    const [showOnlyMine, setShowOnlyMine] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const pageSize = 4;

    const { getRole, token, login } = useStorage();
    const isAdmin = useMemo(() => getRole() === Role.ADMIN, [getRole]);

    const [flatToEdit, setFlatToEdit] =
        useState<FlatDTO | null>(null);

    const [isLoading, setIsLoading] = useState(true);
    const [toast, setToast] = useState<{
        message: string;
        type: "success" | "error";
    } | null>(null);

    const [isSaving, setIsSaving] = useState(false);
    const [deletingMarineId, setDeletingMarineId] = useState<number | null>(null);

    const [isInitialLoading, setIsInitialLoading] = useState(true);

    const [isPageChanging, setIsPageChanging] = useState(false);

    // Add search state
    const [searchQuery, setSearchQuery] = useState("");

    const fetchFlats = useCallback(async () => {
        if (isInitialLoading) {
            setIsLoading(true);
        }
        setIsPageChanging(true);
        const response = await fetchFlatsWithPagination(
            token,
            currentPage - 1,
            pageSize,
            sortColumn,
            sortDirection
        );
        if (response.status !== 200) {
            setToast({
                message: response.data.message || "Не удалось получить квартиры",
                type: "error",
            });
            return;
        }
        setFlats(response.data.content);
        setTotalPages(response.data.totalPages);
        setIsLoading(false);
        setIsInitialLoading(false);
        setIsPageChanging(false);
    }, [currentPage, pageSize, sortColumn, sortDirection, token, isInitialLoading]);


    useEffect(() => {
        fetchFlats();
    }, [fetchFlats]);


    const handleDelete = useCallback(
        async (id: number) => {
            setDeletingMarineId(id);
            try {
                await deleteFlat(token, id);
            } catch (error) {
                console.error("Error deleting flat:", error);
                setToast({
                    message: "Не удал��сь удалить квартиру",
                    type: "error",
                });
            } finally {
                setDeletingMarineId(null);
            }
        },
        [token, setToast]
    );

    // Update the filtered and sorted flats logic - remove pagination since it's handled server-side
    const filteredAndSortedFlats = useMemo(() => {
        return flats
            .filter((flat) => {
                // First filter by "show only mine" if active
                if (showOnlyMine && flat.user.username !== login) {
                    return false;
                }
                
                // Then filter by search query if present
                if (searchQuery) {
                    const searchLower = searchQuery.toLowerCase();
                    return (
                        flat.id.toString().includes(searchLower) ||
                        flat.name.toLowerCase().includes(searchLower) ||
                        `${flat.coordinates.x}, ${flat.coordinates.y}`.toLowerCase().includes(searchLower) ||
                        flat.area.toString().includes(searchLower) ||
                        flat.price.toString().includes(searchLower) ||
                        flat.timeToMetroOnFoot.toString().includes(searchLower) ||
                        flat.numberOfRooms.toString().includes(searchLower) ||
                        flat.numberOfBathrooms.toString().includes(searchLower) ||
                        flat.timeToMetroByTransport.toString().includes(searchLower) ||
                        flat.view.toLowerCase().includes(searchLower) ||
                        (flat.house?.name || "").toLowerCase().includes(searchLower) ||
                        flat.user.username.toLowerCase().includes(searchLower)
                    );
                }
                return true;
            });
    }, [flats, showOnlyMine, login, searchQuery]);

    const [isPopUpOpen, setIsPopUpOpen] = useState(false);
    const [selectedFlatId, setSelectedFlatId] = useState<number | null>(null);

    const handleEdit = useCallback(
        (id: number) => {
            const flatToEdit = flats.find((flat) => flat.id === id);
            if (flatToEdit) {
                const editData: FlatDTO = {
                    name: flatToEdit.name,
                    coordinates: flatToEdit.coordinates,
                    area: flatToEdit.area,
                    price: flatToEdit.price,
                    balcony: flatToEdit.balcony,
                    timeToMetroOnFoot: flatToEdit.timeToMetroOnFoot,
                    numberOfRooms: flatToEdit.numberOfRooms,
                    numberOfBathrooms: flatToEdit.numberOfBathrooms,
                    timeToMetroByTransport: flatToEdit.timeToMetroByTransport,
                    view: flatToEdit.view,
                    houseId: flatToEdit.house?.id || -1,
                    creationDate: flatToEdit.creationDate,
                };
                setFlatToEdit(editData);
            }
            setSelectedFlatId(id);
            setIsPopUpOpen(true);
        },
        [flats]
    );

    const handleSave = async (flatDTO: FlatDTO) => {
        setIsSaving(true);
        try {
            // Validate all required fields according to constraints
            if (!flatDTO.name || flatDTO.name.trim().length === 0) {
                throw new Error("Название не может быть пустым");
            }
            if (!flatDTO.coordinates) {
                throw new Error("Координаты не могут быть пустыми");
            }
            if (flatDTO.area <= 0) {
                throw new Error("Площадь должна быть больше 0");
            }
            if (flatDTO.price <= 0) {
                throw new Error("Цена должна быть больше 0");
            }
            if (flatDTO.timeToMetroOnFoot <= 0) {
                throw new Error("Время до метро пешком должно быть больше 0");
            }
            if (flatDTO.numberOfRooms <= 0 || flatDTO.numberOfRooms > 7) {
                throw new Error("Количество комнат должно быть между 1 и 7");
            }
            if (flatDTO.numberOfBathrooms <= 0) {
                throw new Error("Количество ванных комнат должно быть больше 0");
            }
            if (flatDTO.timeToMetroByTransport <= 0) {
                throw new Error("Время до метро на транспорте должно быть больше 0");
            }
            if (!flatDTO.view) {
                throw new Error("Вид не может быть пустым");
            }
            if (flatDTO.houseId === -1) {
                throw new Error("Дом не может быть пустым");
            }

            // If we've made it this far, all validations have passed
            if (selectedFlatId) {
                const response = await updateFlat(token, selectedFlatId, flatDTO);
                if (response.status !== 200) {
                    setToast({
                        message: response.data.message || "Не удалось обновить квартиру",
                        type: "error",
                    });
                    return;
                } else {
                    setToast({
                        message: "Квартира обновлена",
                        type: "success",
                    });
                }
            } else {
                const response = await createFlat(token, flatDTO);
                if (response.status !== 200) {
                    setToast({
                        message: response.data.message || "Не удалось создать квартиру",
                        type: "error",
                    });
                    return;
                } else {
                    setToast({
                        message: "Квартира добавлена",
                        type: "success",
                    });
                }
            }
            setIsPopUpOpen(false);
            setFlatToEdit(null);
        } catch (error) {
            console.error("Error saving flat:", error);
            setToast({
                message: error instanceof Error ? error.message : "Не удалось создать квартиру",
                type: "error",
            });
        } finally {
            setIsSaving(false);
        }
    };

    // WebSocket handlers
    const handleFlatUpdate = useCallback((updatedFlat: Flat) => {
        setFlats(prevFlats =>
            prevFlats.map(flat =>
                flat.id === updatedFlat.id ? updatedFlat : flat
            )
        );
    }, [setToast]);

    const handleFlatCreate = useCallback((_: Flat) => {
        fetchFlats();
    }, [fetchFlats]);

    const handleFlatDelete = useCallback((_: number) => {
        fetchFlats();
    }, [fetchFlats]);

    // Initialize WebSocket connection
    useEffect(() => {
        const client = createFlatWebSocket(
            handleFlatUpdate,
            handleFlatCreate,
            handleFlatDelete
        );

        client.activate();

        return () => {
            if (client.active) {
                client.deactivate();
            }
        };
    }, [handleFlatUpdate, handleFlatCreate, handleFlatDelete]);

    // Update table rows rendering
    const tableRows = useMemo(() => {
        return filteredAndSortedFlats.map((flat) => (
            <tr key={flat.id} className="border-b border-gray-200 hover:bg-gray-100 text-center h-16">
                <td className="p-3">{flat.id}</td>
                <td className="p-3">{flat.name}</td>
                <td className="p-3">{`(${flat.coordinates.x}, ${flat.coordinates.y})`}</td>
                <td className="p-3">{flat.area}</td>
                <td className="p-3">{flat.price}</td>
                <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${flat.balcony ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {flat.balcony ? "Есть" : "Нет"}
                    </span>
                </td>
                <td className="p-3">{flat.timeToMetroOnFoot}</td>
                <td className="p-3">{flat.numberOfRooms}</td>
                <td className="p-3">{flat.numberOfBathrooms}</td>
                <td className="p-3">{flat.timeToMetroByTransport}</td>
                <td className="p-3">{flat.view}</td>
                <td className="p-3">{flat.house?.name || "No House"}</td>
                <td className="p-3">{flat.user.username}</td>
                <td className="p-3">
                    <div className="flex justify-center space-x-2">
                        {(isAdmin || login === flat.user.username) && (
                            <>
                                <button
                                    onClick={() => handleEdit(flat.id)}
                                    disabled={isSaving || deletingMarineId === flat.id}
                                    className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-md transition-colors duration-300"
                                    title="Редактировать"
                                >
                                    <FaEdit size={16} />
                                </button>
                                <button
                                    onClick={() => handleDelete(flat.id)}
                                    disabled={isSaving || deletingMarineId === flat.id}
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
        ));
    }, [
        filteredAndSortedFlats,
        isAdmin,
        login,
        isSaving,
        deletingMarineId,
        handleEdit,
        handleDelete,
    ]);

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

    // Add search handler
    const handleSearch = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(event.target.value);
    }, []);

    return (
        <div className="min-h-screen flex flex-col items-center p-4 relative font-sans">
            <div className="w-full max-w-8xl space-y-6">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2 text-center">
                    Список квартир
                </h1>

                <div className="bg-gray-50 rounded-xl shadow-lg border border-gray-200 p-6 space-y-6">
                    <div className="flex items-center space-x-4">
                        <input
                            type="text"
                            placeholder="Поиск по всем полям..."
                            value={searchQuery}
                            onChange={handleSearch}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors duration-300"
                        />
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
                                setSelectedFlatId(null);
                                setIsPopUpOpen(true);
                            }}
                            className="text-sm font-medium text-white bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700 transition-all duration-300"
                        >
                            Добавить новую квартиру
                        </button>
                    </div>

                    <div className="overflow-x-auto rounded-lg border border-gray-200">
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
                                                    onClick={() => handleSort("coordinates")}
                                                    className="cursor-pointer hover:text-blue-600 text-gray-600 font-medium w-48 flex items-center justify-center"
                                                >
                                                    Координаты {sortColumn === "coordinates" && (sortDirection === "asc" ? "↑" : "↓")}
                                                </span>
                                            </div>
                                        </th>
                                        <th className="p-3 whitespace-nowrap">
                                            <div className="flex flex-col items-center">
                                                <span
                                                    onClick={() => handleSort("area")}
                                                    className="cursor-pointer hover:text-blue-600 text-gray-600 font-medium w-48 flex items-center justify-center"
                                                >
                                                    Площадь {sortColumn === "area" && (sortDirection === "asc" ? "↑" : "↓")}
                                                </span>
                                            </div>
                                        </th>
                                        <th className="p-3 whitespace-nowrap">
                                            <div className="flex flex-col items-center">
                                                <span
                                                    onClick={() => handleSort("price")}
                                                    className="cursor-pointer hover:text-blue-600 text-gray-600 font-medium w-48 flex items-center justify-center"
                                                >
                                                    Цена {sortColumn === "price" && (sortDirection === "asc" ? "↑" : "↓")}
                                                </span>
                                            </div>
                                        </th>
                                        <th className="p-3 whitespace-nowrap">
                                            <div className="flex flex-col items-center">
                                                <span
                                                    onClick={() => handleSort("balcony")}
                                                    className="cursor-pointer hover:text-blue-600 text-gray-600 font-medium w-48 flex items-center justify-center"
                                                >
                                                    Балкон {sortColumn === "balcony" && (sortDirection === "asc" ? "↑" : "↓")}
                                                </span>
                                            </div>
                                        </th>
                                        <th className="p-3 whitespace-nowrap">
                                            <div className="flex flex-col items-center">
                                                <span
                                                    onClick={() => handleSort("timeToMetroOnFoot")}
                                                    className="cursor-pointer hover:text-blue-600 text-gray-600 font-medium w-48 flex items-center justify-center"
                                                >
                                                    Время до метро пешком {sortColumn === "timeToMetroOnFoot" && (sortDirection === "asc" ? "↑" : "↓")}
                                                </span>
                                            </div>
                                        </th>
                                        <th className="p-3 whitespace-nowrap">
                                            <div className="flex flex-col items-center">
                                                <span
                                                    onClick={() => handleSort("numberOfRooms")}
                                                    className="cursor-pointer hover:text-blue-600 text-gray-600 font-medium w-48 flex items-center justify-center"
                                                >
                                                    Количество комнат {sortColumn === "numberOfRooms" && (sortDirection === "asc" ? "↑" : "↓")}
                                                </span>
                                            </div>
                                        </th>
                                        <th className="p-3 whitespace-nowrap">
                                            <div className="flex flex-col items-center">
                                                <span
                                                    onClick={() => handleSort("numberOfBathrooms")}
                                                    className="cursor-pointer hover:text-blue-600 text-gray-600 font-medium w-48 flex items-center justify-center"
                                                >
                                                    Количество ванных комнат {sortColumn === "numberOfBathrooms" && (sortDirection === "asc" ? "↑" : "↓")}
                                                </span>
                                            </div>
                                        </th>
                                        <th className="p-3 whitespace-nowrap">
                                            <div className="flex flex-col items-center">
                                                <span
                                                    onClick={() => handleSort("timeToMetroByTransport")}
                                                    className="cursor-pointer hover:text-blue-600 text-gray-600 font-medium w-48 flex items-center justify-center"
                                                >
                                                    Время до метро на транспорте {sortColumn === "timeToMetroByTransport" && (sortDirection === "asc" ? "↑" : "↓")}
                                                </span>
                                            </div>
                                        </th>
                                        <th className="p-3 whitespace-nowrap">
                                            <div className="flex flex-col items-center">
                                                <span
                                                    onClick={() => handleSort("view")}
                                                    className="cursor-pointer hover:text-blue-600 text-gray-600 font-medium w-48 flex items-center justify-center"
                                                >
                                                    Вид {sortColumn === "view" && (sortDirection === "asc" ? "↑" : "↓")}
                                                </span>
                                            </div>
                                        </th>
                                        <th className="p-3 whitespace-nowrap">
                                            <div className="flex flex-col items-center">
                                                <span
                                                    onClick={() => handleSort("house")}
                                                    className="cursor-pointer hover:text-blue-600 text-gray-600 font-medium w-48 flex items-center justify-center"
                                                >
                                                    Дом {sortColumn === "house" && (sortDirection === "asc" ? "↑" : "↓")}
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
                                        <th className="p-3 min-w-48"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {tableRows}
                                </tbody>
                            </table>
                        )}
                    </div>

                    <div className="flex justify-center mt-4">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                </div>
            </div>

            <PopUpWindow isOpen={isPopUpOpen} onClose={() => {
                setIsPopUpOpen(false);
                setFlatToEdit(null);
            }}>
                <FlatForm
                    id={selectedFlatId}
                    initialData={flatToEdit}
                    setFlatToEdit={setFlatToEdit}
                />
                <div className="flex justify-end space-x-4 mt-4 w-full">
                    <button
                        onClick={() => flatToEdit && handleSave(flatToEdit)}
                        disabled={isSaving}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm font-bold w-full uppercase tracking-wider transition-colors duration-300"
                    >
                        {isSaving ? "Сохранение..." : "Подтвердить"}
                    </button>
                    <button
                        onClick={() => {
                            setIsPopUpOpen(false);
                            setFlatToEdit(null);
                        }}
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

            {isPageChanging}
        </div>
    );
};

export default FlatList;
