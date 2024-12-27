import React from "react";
import {
  RiHomeSmileLine,
  RiMapPinLine,
  RiSearchLine,
  RiMoneyDollarCircleLine,
  RiSubwayLine,
} from "react-icons/ri";
import { useStorage } from "../../storage/storage";
import * as dashboardApi from "../../api/rest/dashboard";
import PopUpWindow from "../PopUpWindow";
import Toast from "../Toast";
import { Flat } from "../../types/Flat";

const Dashboard = () => {
  const { token } = useStorage();
  const [specialOperations, setSpecialOperations] = React.useState({
    nameSubstring: "",
    id1: "",
    id2: "",
    X: 0,
    Y: 0,
  });
  const [popupContent, setPopupContent] = React.useState<string | null>(null);
  const [toast, setToast] = React.useState<{
    message: string;
    type: "success" | "error" | "warning";
  } | null>(null);

  const handleSpecialOperation = async (operation: string) => {
    try {
      let response;
      switch (operation) {
        case "minBathrooms":
          response = await dashboardApi.findMinBathrooms(token);
          if (response.status === 200) {
            const flat = response.data;
            setPopupContent(
              `📍 Квартира с минимальным количеством ванных комнат\n
              ID: ${flat.id}
              🏠 Название:  ${flat.name}
              🚿 Ванных комнат:  ${flat.numberOfBathrooms}
              💰 Стоимость:  ${flat.price.toLocaleString('ru-RU')} ₽
              🏘️ Дом:  ${flat.house.name}`
            );
          }
          break;
        case "maxCoordinates":
          response = await dashboardApi.findMaxCoordinates(token);
          if (response.status === 200) {
            const flat: Flat = response.data;
            setPopupContent(
              `📍 Квартира с максимальными координатами\n
              ID: ${flat.id}
              🏠 Название:  ${flat.name}
              📌 Координаты:  (${flat.coordinates.x}, ${flat.coordinates.y})
              📮 Дом:  ${flat.house.name}`
            );
          }
          break;
        case "findByNamePrefix":
          response = await dashboardApi.findByNamePrefix(token, specialOperations.nameSubstring);
          if (response.status === 200) {
            if (response.data.length > 0) {
              const flatsList: Flat[] = response.data
                .map((flat: Flat, index: number) => 
                  `${index + 1}. ${flat.name}\n`
                )
                .join('\n\n');
              setPopupContent(
                `🔍 Найденные квартиры\n
                ${flatsList}`
              );
            } else {
              setToast({ message: "Квартиры не найдены", type: "warning" });
            }
          }
          break;
        case "comparePrices":
          response = await dashboardApi.comparePrices(token, specialOperations.id1, specialOperations.id2);
          if (response.status === 200) {
            const cheaperFlat: Flat = response.data;
            setPopupContent(
              `💰 Результат сравнения цен\n
              🏠 Более выгодная квартира:  ${cheaperFlat.name}
              💵 Стоимость:  ${cheaperFlat.price.toLocaleString('ru-RU')} ₽`
            );
          }
          break;
        case "sortByMetroTime":
          response = await dashboardApi.sortByMetroTime(token, specialOperations.X, specialOperations.Y);
          if (response.status === 200) {
            const sortedList: Flat[] = response.data
              .map((flat: Flat, index: number) => 
                `${index + 1}. ${flat.name}\n  🕒 ${flat.timeToMetroByTransport} минут до метро`
              )
              .join('\n\n');
            setPopupContent(
              `🚇 Сортировка по времени до метро\n
              ${sortedList}`
            );
          }
          break;
      }

      if (response && response.status !== 200) {
        setToast({
          message: response.data.message || "Произошла ошибка при выполнении операции",
          type: "warning",
        });
      }
    } catch (error) {
      setToast({
        message: "Произошла ошибка... Возможно, мы не можем подключиться к серверу.",
        type: "error",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Панель управления</h1>
          <p className="mt-2 text-gray-600">Специальные операции с квартирами</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <OperationCard
            icon={<RiHomeSmileLine className="text-blue-500 text-2xl" />}
            title="Минимум ванных комнат"
            description="Найти квартиру с минимальным количеством ванных комнат"
            onExecute={() => handleSpecialOperation("minBathrooms")}
          />

          <OperationCard
            icon={<RiMapPinLine className="text-green-500 text-2xl" />}
            title="Максимальные координаты"
            description="Найти квартиру с максимальными координатами"
            onExecute={() => handleSpecialOperation("maxCoordinates")}
          />

          <OperationCard
            icon={<RiSearchLine className="text-yellow-500 text-2xl" />}
            title="Поиск по префиксу"
            description="Найти квартиры по префиксу названия"
            input={{
              value: specialOperations.nameSubstring,
              onChange: (value) => setSpecialOperations(prev => ({ ...prev, nameSubstring: value })),
              placeholder: "Введите префикс"
            }}
            onExecute={() => handleSpecialOperation("findByNamePrefix")}
          />

          <OperationCard
            icon={<RiMoneyDollarCircleLine className="text-red-500 text-2xl" />}
            title="Сравнение цен"
            description="Сравнить цены двух квартир"
            input={{
              value: specialOperations.id1,
              onChange: (value) => setSpecialOperations(prev => ({ ...prev, id1: value })),
              placeholder: "ID первой квартиры"
            }}
            secondInput={{
              value: specialOperations.id2,
              onChange: (value) => setSpecialOperations(prev => ({ ...prev, id2: value })),
              placeholder: "ID второй квартиры"
            }}
            onExecute={() => handleSpecialOperation("comparePrices")}
          />

          <OperationCard
            icon={<RiSubwayLine className="text-purple-500 text-2xl" />}
            title="Сортировка по метро"
            description="Сортировать квартиры по времени до метро"
            input={{
              value: specialOperations.X.toString(),
              onChange: (value) => setSpecialOperations(prev => ({ ...prev, X: parseFloat(value) || 0 })),
              placeholder: "X координата метро",
              type: "number"
            }}
            secondInput={{
              value: specialOperations.Y.toString(),
              onChange: (value) => setSpecialOperations(prev => ({ ...prev, Y: parseFloat(value) || 0 })),
              placeholder: "Y координата метро",
              type: "number"
            }}
            onExecute={() => handleSpecialOperation("sortByMetroTime")}
          />
        </div>
      </div>

      <PopUpWindow isOpen={popupContent !== null} onClose={() => setPopupContent(null)}>
        <div className="p-6 text-gray-700 whitespace-pre-line">{popupContent}</div>
      </PopUpWindow>

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
};

interface OperationCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  input?: {
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    type?: string;
  };
  secondInput?: {
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    type?: string;
  };
  onExecute: () => void;
}

const OperationCard: React.FC<OperationCardProps> = ({
  icon,
  title,
  description,
  input,
  secondInput,
  onExecute,
}) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:border-blue-400 transition-all duration-300">
    <div className="flex items-center gap-4 mb-4">
      <div className="p-3 bg-gray-50 rounded-lg">{icon}</div>
      <div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </div>
    
    {input && (
      <input
        type={input.type || "text"}
        value={input.value}
        onChange={(e) => input.onChange(e.target.value)}
        placeholder={input.placeholder}
        className="w-full px-4 py-2 mb-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
    )}
    
    {secondInput && (
      <input
        type={secondInput.type || "text"}
        value={secondInput.value}
        onChange={(e) => secondInput.onChange(e.target.value)}
        placeholder={secondInput.placeholder}
        className="w-full px-4 py-2 mb-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
    )}

    <button
      onClick={onExecute}
      className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-300"
    >
      Выполнить
    </button>
  </div>
);

export default Dashboard;
