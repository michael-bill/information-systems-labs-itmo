import { HTTP_URL } from "../const";
import axios from "axios";

const BASE_URL = `${HTTP_URL}/auth`;


/**
 * Authenticates a user with username and password.
 * @param {string} username - The user's username.
 * @param {string} password - The user's password.
 */
export const login = async (username: string, password: string) => {
  try {
    const response = await axios.post(`${BASE_URL}/sign-in`, {
      username,
      password,
    });
    return response;
  } catch (error: any) {
    if (error.response) {
      // Return the error response instead of throwing
      return error.response;
    }
    // For network errors or other issues, return a formatted error
    return {
      status: 500,
      data: { message: error.message }
    };
  }
};

/**
 * Registers a new user with username and password.
 * @param {string} username - The desired username.
 * @param {string} password - The desired password.
 */
export const register = async (username: string, password: string) => {
  try {
    const response = await axios.post(`${BASE_URL}/sign-up`, {
      username,
      password,
    });
    return response;
  } catch (error: any) {
    if (error.response) {
      // Return the error response instead of throwing
      return error.response;
    }
    // For network errors or other issues, return a formatted error
    return {
      status: 500,
      data: { message: error.message }
    };
  }
};
