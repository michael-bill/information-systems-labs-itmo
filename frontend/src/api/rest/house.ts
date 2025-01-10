import axios from "axios";
import { House } from "../../types/House";
import { HTTP_URL } from "../const";

const BASE_URL = `${HTTP_URL}/house`;

export const fetchHouses = async (token: string) => {
  try {
    const response = await axios.get(`${BASE_URL}/get-all`, {
      params: {
        page: 0,
        size: 1000000,
      },
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.data.status === "error") {
      throw new Error(response.data.message);
    }
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


export const createHouse = async (
  token: string,
  house: Omit<House, "id" | "user">
) => {
  try {
    const response = await axios.post(`${BASE_URL}/create`, house, {
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

export const getAllFlatsForHouse = async (token: string, houseId: number) => {
  try {
    const response = await axios.get(`${BASE_URL}/get-all-flats/${houseId}`, {
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

export const getHouseById = async (token: string, houseId: number) => {
  try {
    const response = await axios.get(`${BASE_URL}/get/${houseId}`, {
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

export const fetchWithPagination = async (token: string, page: number, size: number, sortBy: string, sortOrder: string) => {
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

export const updateHouse = async (token: string, house: House) => {
  try {
    const response = await axios.put(`${BASE_URL}/update/${house.id}`, {
      name: house.name,
      year: house.year,
      numberOfFlatsOnFloor: house.numberOfFlatsOnFloor,
    }, {
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

export const deleteHouse = async (token: string, houseId: number) => {
  try {
    const response = await axios.delete(`${BASE_URL}/delete/${houseId}`, {
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
    `${BASE_URL}/get-by-filter?page=${page}&size=${size}&sort=${sortColumn},${sortDirection}`,
    filterParams,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};