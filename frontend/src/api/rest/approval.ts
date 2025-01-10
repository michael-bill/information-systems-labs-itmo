import axios from "axios";
import { HTTP_URL } from "../const";

const BASE_URL = `${HTTP_URL}/admin-creation`;


export const rejectApproval = async (token: string, id: number) => {
  try {
    const response = await axios.get(`${BASE_URL}/reject-request`, {
      params: {
        requestId: id
    },
      headers: {
        Authorization: `Bearer ${token}`
      }
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

export const getMyApprovals = async (token: string) => {
  try {
    const response = await axios.get(`${BASE_URL}/get-my-requests`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
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

export const getAllApprovals = async (token: string, page: number, size: number, sort: string, sortDirection: string) => {
  try {
    let sortString = sort ? `${sort},${sortDirection}` : '';
    const response = await axios.get(`${BASE_URL}/get-all-requests`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { page, size, sort: sortString },
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

export const getApprovalById = async (token: string, id: number) => {
  try {
    const response = await axios.get(`${BASE_URL}/get-request/${id}`, {
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
}

export const createApproval = async (token: string) => {
  try {
    const response = await axios.get(`${BASE_URL}/create-request`, {
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
}

export const approveApproval = async (token: string, id: number) => {
  try {
    const response = await axios.get(`${BASE_URL}/approve-request`, {
      params: { requestId: id },
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
}