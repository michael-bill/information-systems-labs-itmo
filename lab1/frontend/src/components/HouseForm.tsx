import { useState } from "react";
import { House } from "../types/House";

interface HouseFormProps {
  id: number | null;
  setHouseToEdit: (house: House) => void;
  initialHouse: House | null; // Add this prop
}

const HouseForm = ({ id, setHouseToEdit, initialHouse }: HouseFormProps) => {
  const [house, setHouse] = useState<House>(
    initialHouse || {
      id: id || 0,
      name: "",
      year: 0,
      numberOfFlatsOnFloor: 0,
      user: { id: 0, username: "" },
      editable: false,
    }
  );

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    
    // Add validation logic
    if (name === "year") {
      const yearValue = parseInt(value);
      if (yearValue <= 0 || yearValue > 552) return;
    }
    
    if (name === "numberOfFlatsOnFloor") {
      const flatsValue = parseInt(value);
      if (flatsValue <= 0) return;
    }

    const updatedHouse = { ...house, [name]: value };
    setHouse(updatedHouse);
    setHouseToEdit(updatedHouse);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {id ? (
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Редактирование дома #{id}</h2>
      ) : (
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Создание дома</h2>
      )}
      <div className="space-y-4 text-gray-800">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-600 mb-1">Name</label>
            <input
              type="text"
              name="name"
              value={house.name}
              onChange={handleInputChange}
              className="w-full p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Название дома"
              required
              minLength={1} // Name cannot be null/empty
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Год постройки (1-552)</label>
            <input
              type="number"
              name="year"
              value={house.year}
              onChange={handleInputChange}
              className="w-full p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Год постройки"
              required
              min={1}
              max={552}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Количество квартир на этаже (больше 0)</label>
            <input
              type="number"
              name="numberOfFlatsOnFloor"
              value={house.numberOfFlatsOnFloor}
              onChange={handleInputChange}
              className="w-full p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Количество квартир"
              required
              min={1}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HouseForm;
