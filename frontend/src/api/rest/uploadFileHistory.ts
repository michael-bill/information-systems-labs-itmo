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
