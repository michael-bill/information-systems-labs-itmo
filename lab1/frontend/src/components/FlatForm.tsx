import { useEffect, useState, useCallback } from "react";
import { View } from "../types/View";
import { House } from "../types/House";
import { useStorage } from "../storage/storage";
import { FlatDTO } from "../types/FlatDTO";
import * as houseApi from "../api/rest/house";
interface FlatFormProps {
    id: number | null;
    initialData?: FlatDTO | null;
    setFlatToEdit: (flat: FlatDTO) => void;
}

const FlatForm = ({ id, initialData, setFlatToEdit }: FlatFormProps) => {
    const { token } = useStorage();
    const [flatDTO, setFlatDTO] = useState<FlatDTO>(
        initialData || {
            name: "",
            coordinates: { x: 0, y: 0 },
            area: 0,
            price: 0,
            balcony: false,
            timeToMetroOnFoot: 0,
            numberOfRooms: 1,
            numberOfBathrooms: 1,
            timeToMetroByTransport: 0,
            view: View.STREET,
            houseId: -1,
            creationDate: new Date().toISOString(),
            editable: true,
        }
    );

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value, type } = e.target;
        let updatedValue: any = value;

        // Handle different input types and validate according to constraints
        if (type === "checkbox") {
            updatedValue = (e.target as HTMLInputElement).checked;
        } else if (type === "number") {
            switch (name) {
                case "area":
                case "price":
                    // Must be greater than 0
                    updatedValue = Math.max(1, parseFloat(value) || 1);
                    break;
                case "numberOfRooms":
                    // Must be greater than 0 and maximum value is 7
                    updatedValue = Math.min(7, Math.max(1, parseInt(value) || 1));
                    break;
                case "numberOfBathrooms":
                    // Must be greater than 0
                    updatedValue = Math.max(1, parseInt(value) || 1);
                    break;
                case "timeToMetroOnFoot":
                case "timeToMetroByTransport":
                    // Must be greater than 0
                    updatedValue = Math.max(1, parseInt(value) || 1);
                    break;
                default:
                    updatedValue = parseInt(value) || 0;
            }
        }

        // Update the flatDTO state
        setFlatDTO(prev => {
            const newFlatDTO = { ...prev };
            
            if (name === "x" || name === "y") {
                newFlatDTO.coordinates = {
                    ...newFlatDTO.coordinates,
                    [name]: updatedValue
                };
            } else if (name === "houseId") {
                // House cannot be null
                newFlatDTO.houseId = value === "" ? -1 : parseInt(value);
            } else {
                (newFlatDTO as any)[name] = updatedValue;
            }
            
            setFlatToEdit(newFlatDTO);
            return newFlatDTO;
        });
    };

    const handleCoordinateChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        coord: "x" | "y"
    ) => {
        const { value } = e.target;
        let updatedValue = parseInt(value) || 0;

        if (coord === "x") {
            updatedValue = Math.min(761, Math.max(0, updatedValue));
        } else if (coord === "y") {
            updatedValue = Math.max(-351, updatedValue);
        }

        const updatedFlatDTO = {
            ...flatDTO,
            coordinates: {
                ...flatDTO.coordinates,
                [coord]: updatedValue,
            },
        };
        setFlatDTO(updatedFlatDTO);
        setFlatToEdit(updatedFlatDTO);
    };

    const [houses, setHouses] = useState<House[]>([]);

    const fetchHouses = useCallback(async () => {
        try {
            const { data } = await houseApi.fetchHouses(token);
            setHouses(data.content);
        } catch (error) {
            console.error("Error fetching houses:", error);
        }
    }, [token]);

    useEffect(() => {
        fetchHouses();
    }, [fetchHouses]);

    useEffect(() => {
        if (initialData) {
            setFlatDTO(initialData);
            setFlatToEdit(initialData);
        }
    }, [initialData, setFlatToEdit]);

    return (
        <div className="w-full max-w-2xl mx-auto">
            {id ? (
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Editing Flat #{id}</h2>
            ) : (
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Creating New Flat</h2>
            )}
            <div className="space-y-4 text-gray-800">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-600 mb-1">Name</label>
                        <input
                            type="text"
                            name="name"
                            value={flatDTO.name}
                            onChange={handleInputChange}
                            className="w-full p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Название квартиры"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                            X Coordinate
                        </label>
                        <input
                            type="number"
                            value={flatDTO.coordinates.x}
                            onChange={(e) => handleCoordinateChange(e, "x")}
                            className="w-full p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="X координата"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                            Y Coordinate (Min: -594)
                        </label>
                        <input
                            type="number"
                            value={flatDTO.coordinates.y}
                            onChange={(e) => handleCoordinateChange(e, "y")}
                            className="w-full p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Y координата"
                            min={-594}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Area (m²)</label>
                        <input
                            type="number"
                            name="area"
                            value={flatDTO.area}
                            onChange={handleInputChange}
                            className="w-full p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Площадь"
                            min={0}
                            step="0.01"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Price</label>
                        <input
                            type="number"
                            name="price"
                            value={flatDTO.price}
                            onChange={handleInputChange}
                            className="w-full p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Цена"
                            min={0}
                            step="0.01"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Number of Rooms</label>
                        <input
                            type="number"
                            name="numberOfRooms"
                            value={flatDTO.numberOfRooms}
                            onChange={handleInputChange}
                            className="w-full p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Количество комнат"
                            min={1}
                            max={7}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Number of Bathrooms</label>
                        <input
                            type="number"
                            name="numberOfBathrooms"
                            value={flatDTO.numberOfBathrooms}
                            onChange={handleInputChange}
                            className="w-full p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Количество ванных комнат"
                            min={1}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Time to Metro (Walking)</label>
                        <input
                            type="number"
                            name="timeToMetroOnFoot"
                            value={flatDTO.timeToMetroOnFoot}
                            onChange={handleInputChange}
                            className="w-full p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Время до метро пешком"
                            min={1}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Time to Metro (Transport)</label>
                        <input
                            type="number"
                            name="timeToMetroByTransport"
                            value={flatDTO.timeToMetroByTransport}
                            onChange={handleInputChange}
                            className="w-full p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Время до метро на транспорте"
                            min={0}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">View</label>
                        <select
                            name="view"
                            value={flatDTO.view}
                            onChange={handleInputChange}
                            className="w-full p-2 bg-white text-gray-800 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                        >
                            <option value="" disabled>Select a view type</option>
                            {Object.values(View).map((view) => (
                                <option key={view} value={view}>{view}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">House</label>
                        <select
                            name="houseId"
                            value={flatDTO.houseId ?? ""}
                            onChange={handleInputChange}
                            className="w-full p-2 bg-white text-gray-800 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">No House</option>
                            {houses.map((house) => (
                                <option key={house.id} value={house.id}>{house.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="md:col-span-2">
                        <div className="flex items-center space-x-3">
                            <span className="text-sm font-medium text-gray-600">Balcony</span>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="balcony"
                                    className="sr-only peer"
                                    checked={flatDTO.balcony}
                                    onChange={handleInputChange}
                                />
                                <div className="w-11 h-6 bg-gray-300 peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FlatForm; 