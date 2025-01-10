import React, { useState, useEffect, useRef, useCallback } from "react";
import PopUpWindow from "../PopUpWindow";
import Toast from "../Toast";
import * as flatApi from "../../api/rest/flat";
import { useStorage } from "../../storage/storage";
import { Flat } from "../../types/Flat";
import { createFlatWebSocket } from "../../api/ws/flatWS";

const generateColorFromString = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    // Use a more complex hashing algorithm with bit operations
    hash = ((hash << 13) - hash) ^ str.charCodeAt(i);
    hash = Math.imul(hash, 16777619); // FNV-1a hash
    hash = hash ^ (hash >>> 15);
  }

  // Generate HSL color with good saturation and lightness
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 70%, 65%)`;
};

const FlatMap: React.FC = () => {
  const [flats, setFlats] = useState<Flat[]>([]);
  const [selectedFlat, setSelectedFlat] = useState<Flat | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [transform, setTransform] = useState({ x: 500, y: 0, scale: 1 });
  const mapRef = useRef<SVGSVGElement>(null);

  const { token } = useStorage();

  // Map constants
  const MAP_WIDTH = 1000;
  const MAP_HEIGHT = 1000;

  const fetchFlats = async () => {
    const response = await flatApi.fetchFlatsWithPagination(token, 0, 1000, "id", "asc");
    if (response.status === 200) {
      setFlats(response.data.content);
    } else {
      if (response.status !== 500) {
        setToastMessage("Не удалось загрузить квартиры: " + response.data.message);
      } else {
        setToastMessage("Не удалось загрузить квартиры! Сервер недоступен.");
      }
      setShowToast(true);

    }
  };

  useEffect(() => {
    fetchFlats();
  }, []);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const scaleFactor = Math.pow(0.999, e.deltaY);
    const newScale = Math.max(0.1, Math.min(transform.scale * scaleFactor, 5));

    if (mapRef.current) {
      const rect = mapRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const worldX = (mouseX - transform.x) / transform.scale;
      const worldY = (mouseY - transform.y) / transform.scale;

      const newX = mouseX - worldX * newScale;
      const newY = mouseY - worldY * newScale;

      setTransform({ x: newX, y: newY, scale: newScale });
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const startX = e.clientX;
    const startY = e.clientY;
    const startTransform = { ...transform };

    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      setTransform({
        ...startTransform,
        x: startTransform.x + dx,
        y: startTransform.y + dy,
      });
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const getFlatIcon = (flat: Flat) => {
    const userColor = generateColorFromString(flat.user.username);

    return (
      <g>
        <rect
          x="-10"
          y="-10"
          width="20"
          height="20"
          fill={userColor}
          stroke="#000000"
          strokeWidth="2"
        />
        <text
          x="0"
          y="25"
          textAnchor="middle"
          fill="black"
          fontSize="12"
        >{`${flat.name}`}</text>
      </g>
    );
  };

  // Add WebSocket handlers
  const handleFlatUpdate = useCallback((updatedFlat: Flat) => {
    setFlats(prevFlats =>
      prevFlats.map(flat =>
        flat.id === updatedFlat.id ? updatedFlat : flat
      )
    );
  }, []);

  const handleFlatCreate = useCallback((newFlat: Flat) => {
    setFlats(prevFlats => [...prevFlats, newFlat]);
  }, []);

  const handleFlatDelete = useCallback((deletedFlatId: number) => {
    setFlats(prevFlats => prevFlats.filter(flat => flat.id !== deletedFlatId));
  }, []);

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

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <h1 className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 text-4xl font-bold text-center text-blue-500">
        Карта квартир
      </h1>
      <svg
        ref={mapRef}
        className="absolute inset-0 w-full h-full"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
      >
        <g transform={`translate(${transform.x}, ${transform.y}) scale(${transform.scale})`}>
          {/* Background */}
          <rect
            width={MAP_WIDTH}
            height={MAP_HEIGHT}
            rx="10"
            ry="10"
            fill="transparent"
            stroke="#3b82f6"
            strokeWidth="2"
          />

          {/* Flats */}
          {flats.map((flat) => (
            <g
              key={flat.id}
              transform={`translate(${flat.coordinates.x}, ${flat.coordinates.y})`}
              onClick={() => {
                setSelectedFlat(flat);
                setIsPopupOpen(true);
              }}
              style={{ cursor: "pointer" }}
            >
              {getFlatIcon(flat)}
            </g>
          ))}
        </g>
      </svg>

      <PopUpWindow isOpen={isPopupOpen} onClose={() => setIsPopupOpen(false)}>
        {selectedFlat && (
          <div className="rounded-lg p-6">
            <h2 className="text-3xl font-bold mb-4 text-blue-500 border-b border-gray-200 pb-3">
              {selectedFlat.name}
            </h2>

            <div className="space-y-4">
              {/* Price and Area Section */}
              <div className="flex justify-between items-center">
                <div className="bg-gray-50 shadow-md rounded-lg p-3 flex-1 mr-2">
                  <p className="text-gray-600 text-sm">Price</p>
                  <p className="text-green-500 text-xl font-bold">${selectedFlat.price.toLocaleString()}</p>
                </div>
                <div className="bg-gray-50 shadow-md rounded-lg p-3 flex-1 ml-2">
                  <p className="text-gray-600 text-sm">Area</p>
                  <p className="text-blue-500 text-xl font-bold">{selectedFlat.area}m²</p>
                </div>
              </div>

              {/* Room Information */}
              <div className="flex justify-between items-center">
                <div className="bg-gray-50 shadow-md rounded-lg p-3 flex-1 mr-2">
                  <p className="text-gray-600 text-sm">Комнат</p>
                  <p className="text-gray-800 text-xl font-bold">{selectedFlat.numberOfRooms}</p>
                </div>
                <div className="bg-gray-50 shadow-md rounded-lg p-3 flex-1 ml-2">
                  <p className="text-gray-600 text-sm">Количество ванных комнат</p>
                  <p className="text-gray-800 text-xl font-bold">{selectedFlat.numberOfBathrooms}</p>
                </div>
              </div>

              {/* Features */}
              <div className="bg-gray-50 shadow-md rounded-lg p-4">
                <h3 className="text-gray-600 text-sm mb-2">Характеристики</h3>
                <div className="flex items-center mb-2">
                  <div className={`w-3 h-3 rounded-full mr-2 ${selectedFlat.balcony ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-gray-800">Балкон</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full mr-2 bg-blue-500"></div>
                  <span className="text-gray-800">{selectedFlat.view} Вид</span>
                </div>
              </div>

              {/* Metro Access */}
              <div className="bg-gray-50 shadow-md rounded-lg p-4">
                <h3 className="text-gray-600 text-sm mb-3">Расстояние до метро</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">
                      <i className="fas fa-walking mr-2"></i> Пешком
                    </span>
                    <span className="text-gray-800 font-medium">{selectedFlat.timeToMetroOnFoot} мин</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">
                      <i className="fas fa-bus mr-2"></i> Транспорт
                    </span>
                    <span className="text-gray-800 font-medium">{selectedFlat.timeToMetroByTransport} мин</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </PopUpWindow>

      {showToast && (
        <Toast
          message={toastMessage}
          type="error"
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
};

export default FlatMap;
