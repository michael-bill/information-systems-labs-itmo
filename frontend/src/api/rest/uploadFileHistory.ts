import axios from "axios";
import { HTTP_URL } from "../const";

const BASE_URL = `${HTTP_URL}/upload-history`;

export const fetchFlatsWithPagination = async (token: string, page: number, size: number, sortBy: string, sortOrder: string) => {
  const sort = sortBy ? `${sortBy},${sortOrder}` : "";
  try {
    const response = await axios.get(`${BASE_URL}/get-all`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { page, size, sort },
    });
    return response;
  } catch (error: any) {
    if (error.response) {
      return error.response;
    }
    return {
      status: 500,
      data: { message: error.message }
    };
  }
};

export const fetchWithFilter = async (
  token: string,
  filterParams: Record<string, any>,
  page: number,
  size: number,
  sortColumn: string,
  sortDirection: string
) => {
  return await axios.post(
    `${BASE_URL}/get-by-filter`,
    filterParams,
    {
      params: {
        page,
        size,
        sort: `${sortColumn},${sortDirection}`,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export const donwloadFlatFile = async (token: string, id: number) => {

  const response = await axios.get(`${HTTP_URL}/flat/download/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
    responseType: "blob",
  });

  // Создаем ссылку для скачивания
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'flat-file.json'); // имя файла при скачивании

  // Добавляем ссылку в DOM, кликаем по ней и удаляем
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Очищаем URL
  window.URL.revokeObjectURL(url);

  return response;
};

export const donwloadHouseFile = async (token: string, id: number) => {

  const response = await axios.get(`${HTTP_URL}/house/download/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
    responseType: "blob",
  });

  // Создаем ссылку для скачивания
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'house-file.json'); // имя файла при скачивании

  // Добавляем ссылку в DOM, кликаем по ней и удаляем
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Очищаем URL
  window.URL.revokeObjectURL(url);

  return response;
};
