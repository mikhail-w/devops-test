import {
  USER_LOGIN_REQUEST,
  USER_LOGIN_SUCCESS,
  USER_LOGIN_FAIL,
  USER_LOGOUT,
  USER_REGISTER_REQUEST,
  USER_REGISTER_SUCCESS,
  USER_REGISTER_FAIL,
  USER_DETAILS_REQUEST,
  USER_DETAILS_SUCCESS,
  USER_DETAILS_FAIL,
  USER_DETAILS_RESET,
  USER_UPDATE_PROFILE_REQUEST,
  USER_UPDATE_PROFILE_SUCCESS,
  USER_UPDATE_PROFILE_FAIL,
  USER_LIST_REQUEST,
  USER_LIST_SUCCESS,
  USER_LIST_FAIL,
  USER_LIST_RESET,
  USER_DELETE_REQUEST,
  USER_DELETE_SUCCESS,
  USER_DELETE_FAIL,
  USER_UPDATE_REQUEST,
  USER_UPDATE_SUCCESS,
  USER_UPDATE_FAIL,
} from '../constants/userConstants';
import { ORDER_LIST_MY_RESET } from '../constants/orderConstants';
import axiosInstance from '../utils/axiosConfig';

// Utility to extract error messages
const getErrorPayload = error => {
  const detail = error.response?.data?.detail;
  if (detail) {
    return typeof detail === 'string' ? detail : JSON.stringify(detail);
  }
  return error.message;
};

// Login User
export const login = (email, password) => async dispatch => {
  try {
    dispatch({ type: USER_LOGIN_REQUEST });

    const { data } = await axiosInstance.post('/api/users/login/', {
      username: email,
      password,
    });

    dispatch({ type: USER_LOGIN_SUCCESS, payload: data });
    localStorage.setItem('userInfo', JSON.stringify(data));
  } catch (error) {
    console.error('Login error:', error);
    dispatch({ type: USER_LOGIN_FAIL, payload: getErrorPayload(error) });
  }
};

// Logout User
export const logout = () => dispatch => {
  localStorage.removeItem('userInfo');
  localStorage.removeItem('shippingAddress');
  dispatch({ type: USER_LOGOUT });
  dispatch({ type: USER_DETAILS_RESET });
  dispatch({ type: ORDER_LIST_MY_RESET });
  dispatch({ type: USER_LIST_RESET });
};

// Register User
export const register = formData => async dispatch => {
  try {
    dispatch({ type: USER_REGISTER_REQUEST });

    const { data } = await axiosInstance.post('/api/users/register/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    dispatch({ type: USER_REGISTER_SUCCESS, payload: data });
    dispatch({ type: USER_LOGIN_SUCCESS, payload: data });
    localStorage.setItem('userInfo', JSON.stringify(data));
  } catch (error) {
    console.error('Register error:', error);
    dispatch({ type: USER_REGISTER_FAIL, payload: getErrorPayload(error) });
  }
};

// Get User Details
export const getUserDetails = id => async (dispatch, getState) => {
  try {
    dispatch({ type: USER_DETAILS_REQUEST });

    const {
      userLogin: { userInfo },
    } = getState();

    const { data } = await axiosInstance.get(`/api/users/${id}/`, {
      headers: {
        Authorization: userInfo ? `Bearer ${userInfo.token}` : '',
      },
    });

    dispatch({ type: USER_DETAILS_SUCCESS, payload: data });
  } catch (error) {
    dispatch({ type: USER_DETAILS_FAIL, payload: getErrorPayload(error) });
  }
};

// Update User Profile
export const updateUserProfile = userData => async (dispatch, getState) => {
  try {
    dispatch({ type: USER_UPDATE_PROFILE_REQUEST });

    const {
      userLogin: { userInfo },
    } = getState();

    const isFormData = userData instanceof FormData;
    const headers = {
      'Content-Type': isFormData ? 'multipart/form-data' : 'application/json',
      Authorization: userInfo ? `Bearer ${userInfo.token}` : '',
    };

    const { data } = await axiosInstance.put(
      '/api/users/profile/update/',
      isFormData ? userData : userData,
      { headers }
    );

    dispatch({ type: USER_UPDATE_PROFILE_SUCCESS, payload: data });
    dispatch({ type: USER_LOGIN_SUCCESS, payload: data });
    localStorage.setItem('userInfo', JSON.stringify(data));
    return data;
  } catch (error) {
    dispatch({
      type: USER_UPDATE_PROFILE_FAIL,
      payload: getErrorPayload(error),
    });
    throw error;
  }
};

// List Users
export const listUsers = () => async (dispatch, getState) => {
  try {
    dispatch({ type: USER_LIST_REQUEST });

    const {
      userLogin: { userInfo },
    } = getState();

    const { data } = await axiosInstance.get('/api/users/', {
      headers: {
        Authorization: userInfo ? `Bearer ${userInfo.token}` : '',
      },
    });

    dispatch({ type: USER_LIST_SUCCESS, payload: data });
  } catch (error) {
    dispatch({ type: USER_LIST_FAIL, payload: getErrorPayload(error) });
  }
};

// Delete User
export const deleteUser = id => async (dispatch, getState) => {
  try {
    dispatch({ type: USER_DELETE_REQUEST });

    const {
      userLogin: { userInfo },
    } = getState();

    await axiosInstance.delete(`/api/users/delete/${id}/`, {
      headers: {
        Authorization: userInfo ? `Bearer ${userInfo.token}` : '',
      },
    });

    dispatch({ type: USER_DELETE_SUCCESS });
  } catch (error) {
    dispatch({ type: USER_DELETE_FAIL, payload: getErrorPayload(error) });
  }
};

// Update User
export const updateUser = user => async (dispatch, getState) => {
  try {
    dispatch({ type: USER_UPDATE_REQUEST });

    const {
      userLogin: { userInfo },
    } = getState();

    const { data } = await axiosInstance.put(
      `/api/users/update/${user._id}/`,
      user,
      {
        headers: {
          Authorization: userInfo ? `Bearer ${userInfo.token}` : '',
        },
      }
    );

    dispatch({ type: USER_UPDATE_SUCCESS });
    dispatch({ type: USER_DETAILS_SUCCESS, payload: data });
  } catch (error) {
    dispatch({ type: USER_UPDATE_FAIL, payload: getErrorPayload(error) });
  }
};
