import axios from "axios";
import { HTTP_URL } from "../const";
import { FlatDTO } from "../../types/FlatDTO";

const BASE_URL = `${HTTP_URL}/flat`;

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

export const fetchFlats = async (token: string) => {
  try {
    const response = await axios.get(`${BASE_URL}/get-all`, {
      headers: { Authorization: `Bearer ${token}` },
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

export const getFlatById = async (token: string, id: number) => {
  try {
    const response = await axios.get(`${BASE_URL}/get/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
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

export const deleteFlat = async (token: string, id: number) => {
  try {
    const response = await axios.delete(`${BASE_URL}/delete/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
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

export const updateFlat = async (token: string, id: number, flat: FlatDTO) => {
  try {
    const response = await axios.put(`${BASE_URL}/update/${id}`, flat, {
      headers: { Authorization: `Bearer ${token}` },
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

export const createFlat = async (token: string, flat: FlatDTO) => {
  try {
    const response = await axios.post(`${BASE_URL}/create`, flat, {
      headers: { Authorization: `Bearer ${token}` },
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
