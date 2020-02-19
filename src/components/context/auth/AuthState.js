import React, { useReducer, useContext } from "react";
import AuthContext from "./authContext";
import authReducer from "./authReducer";
import AlertContext from "../alert/alertContext";
import { user_db, syncDB } from "../../../pouchdb/db";
import bcrypt from "bcryptjs";
import uuid4 from "uuid/v4";
import jwt from "jsonwebtoken";
import useJsonWebToken from "../../../hooks/useJsonWebToken";

import {
  REGISTER_SUCCESS,
  REGISTER_FAIL,
  USER_LOADED,
  AUTH_ERROR,
  LOGIN_SUCCESS,
  LOGIN_FAIL,
  LOGOUT,
  CLEAR_ERRORS,
  SET_DEVTOOLS
} from "../types";

const jwtSecret = process.env.REACT_APP_JWTSECRET;

const AuthState = props => {
  const initialState = {
    token: localStorage.getItem("token"),
    isAuthenticated: false,
    loading: false,
    user: null,
    error: null,
    devTools: false
  };
  const [state, dispatch] = useReducer(authReducer, initialState);
  const [checkToken] = useJsonWebToken();
  const { setAlertMessage, removeAlert } = useContext(AlertContext);

  // Load User
  const loadUser = async () => {
    try {
      const user = checkToken(localStorage.token);
      if (user._id) {
        const userData = await user_db.get(user._id);

        dispatch({
          type: USER_LOADED,
          payload: userData
        });
        syncDB();
      }
    } catch (err) {
      dispatch({ type: AUTH_ERROR, payload: err.message });
      setAlertMessage(err.message);
    }
  };

  // Register New User
  const register = async formData => {
    const { email, password } = formData;

    const salt = await bcrypt.genSalt(10);

    formData.password = await bcrypt.hash(password, salt);

    formData._id = uuid4();

    const getEmail = email => {
      return user_db.find({
        selector: { email: email },
        fields: ["email"]
      });
    };

    try {
      const matchEmail = await getEmail(email);

      if (matchEmail.docs.length === 0) {
        await user_db.put(formData);

        const payload = {
          user: {
            _id: formData._id
          }
        };

        const token = jwt.sign(payload, jwtSecret, {
          expiresIn: 7200
        });

        dispatch({
          type: REGISTER_SUCCESS,
          payload: token
        });
      } else {
        throw new Error("Ein Benutzer mit dieser Email existiert schon!");
      }
    } catch (err) {
      dispatch({
        type: REGISTER_FAIL,
        payload: err.message
      });
      setAlertMessage(err.message);
    }
  };

  // Login User
  const login = async formData => {
    try {
      const dbResponse = await user_db.find({
        selector: { email: formData.email }
      });

      if (dbResponse.docs.length === 0) {
        throw new Error("Dieser Benutzer existiert nicht. Bitte registrieren.");
      }

      const userData = dbResponse.docs[0];

      const isMatch = await bcrypt.compare(
        formData.password,
        userData.password
      );

      if (!isMatch) {
        throw new Error("Ungültiges Passwort!");
      }

      const payload = {
        user: {
          _id: userData._id,
          role: userData.role || null
        }
      };

      const token = jwt.sign(payload, jwtSecret, {
        expiresIn: 7200
      });

      dispatch({
        type: LOGIN_SUCCESS,
        payload: token
      });

      loadUser();
      removeAlert();
    } catch (err) {
      dispatch({
        type: LOGIN_FAIL,
        payload: err.message
      });
      setAlertMessage(err.message);
    }
  };

  // Logout
  const logout = () => {
    dispatch({ type: LOGOUT });
    removeAlert();
  };

  // Clear Errors
  const clearErrors = () => dispatch({ type: CLEAR_ERRORS });

  // Set DevTools
  const setDevTools = boolean => {
    dispatch({
      type: SET_DEVTOOLS,
      payload: boolean
    });
  };

  return (
    <AuthContext.Provider
      value={{
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        loading: state.loading,
        user: state.user,
        error: state.error,
        devTools: state.devTools,
        register,
        loadUser,
        login,
        logout,
        clearErrors,
        setDevTools
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
};

export default AuthState;
