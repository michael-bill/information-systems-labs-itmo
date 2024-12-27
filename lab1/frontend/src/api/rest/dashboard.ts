import axios from "axios";
import { HTTP_URL } from "../const";

const BASE_URL = `${HTTP_URL}/flat`;


export const findMinBathrooms = async (token: string) => {
  try {
    const response = await axios.get(`${BASE_URL}/get-flat-with-min-number-of-bathrooms`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response;
  } catch (error: any) {
    if (error.response) {
      return error.response;
    }
    return {
      status: 500,
      data: { message: 'An unexpected error occurred' }
    };
  }
};


export const findMaxCoordinates = async (token: string) => {
  try {
    const response = await axios.get(`${BASE_URL}/get-flat-with-max-coordinates`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response;
  } catch (error: any) {
    if (error.response) {
      return error.response;
    }
    return {
      status: 500,
      data: { message: 'An unexpected error occurred' }
    };
  }
};


export const findByNamePrefix = async (token: string, prefix: string) => {
  try {
    const response = await axios.get(`${BASE_URL}/get-flats-by-substring-of-name`, {
      params: { prefix },
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


export const comparePrices = async (token: string, id1: string, id2: string) => {
  try {
    const response = await axios.get(`${BASE_URL}/choose-more-cheaper-flat-by-ids`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { id1, id2 },
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


export const sortByMetroTime = async (token: string) => {
  try {
    const response = await axios.get(`${BASE_URL}/get-flats-ordered-by-time-to-metro-on-foot`, {
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
