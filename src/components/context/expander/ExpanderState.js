import React, { useReducer, useContext } from "react";
import ExpanderContext from "./expanderContext";
import expanderReducer from "./expanderReducer";
import AlertContext from "../../context/alert/alertContext";
import db from "../../indexedDB/db";
import uuid4 from "uuid/v4";
import AuthContext from "../../context/auth/authContext";

import {
  GET_EXPANDER,
  GET_EXPANDER_SUCCESS,
  CLEAR_EXPANDER,
  ADD_EXPANDER_ITEM,
  UPDATE_EXPANDER,
  EXPANDER_ERROR,
  SELECT_EXPANDER_ITEM,
  DELETE_EXPANDER,
  LOCK_EXPANDER_EDITOR,
  SET_EXPANDER_EDITOR
} from "../types";

const ExpanderState = props => {
  const initialState = {
    loading: false,
    expanderUserData: null,
    selectedExpanderItem: null,
    expanderEditorState: null,
    editorLocked: true,
    error: null
  };

  const [state, dispatch] = useReducer(expanderReducer, initialState);
  const { setAlert } = useContext(AlertContext);
  const { user } = useContext(AuthContext);

  // GET_EXPANDER;
  const getExpander = async () => {
    dispatch({ type: GET_EXPANDER });
    if (user !== null) {
      try {
        const data = await db.expanders
          .where("user")
          .equals(user._id)
          .toArray();
        console.log(data);
        dispatch({
          type: GET_EXPANDER_SUCCESS,
          payload: data
        });
      } catch (err) {
        dispatch({ type: EXPANDER_ERROR, payload: err });
      }
    }
  };

  // ADD_EXPANDER_ITEM,
  const addExpanderItem = async (itemElements, longState) => {
    const item = {
      ...itemElements,
      _id: uuid4(),
      user: user._id,
      long: longState
    };
    console.log(item);
    try {
      await db.expanders.add(item).then(
        dispatch({
          type: ADD_EXPANDER_ITEM,
          payload: item
        })
      );
    } catch (err) {
      dispatch({ type: EXPANDER_ERROR, payload: err });
      setAlert(
        "",
        "",
        "Login-Berrechtigung ist abgelaufen. Bitte melde dich erneut an."
      );
    }
  };

  //DELETE_EXPANDER
  const deleteExpander = async id => {
    try {
      await db.expanders.delete(id).then(
        dispatch({
          type: DELETE_EXPANDER,
          payload: id
        })
      );
      // .then(async () => {
      //   try {
      //     dispatch({ type: GET_EXPANDER });

      //     const res = await axios.get("http://localhost:2000/api/expander");
      //     dispatch({
      //       type: GET_EXPANDER_SUCCESS,
      //       payload: res.data
      //     });
      //   } catch (err) {
      //     console.log(err);
      //   }
      // });
    } catch (err) {
      dispatch({ type: EXPANDER_ERROR, payload: err });
      setAlert(
        "",
        "",
        "Login-Berrechtigung ist abgelaufen. Bitte melde dich erneut an."
      );
    }
  };

  // UPDATE_EXPANDER
  const updateExpander = async (itemElements, longState) => {
    const item = { ...itemElements, long: longState };
    try {
      await db.expanders.update(item._id, item).then(
        dispatch({
          type: UPDATE_EXPANDER,
          payload: item
        })
      );
      // .then(async () => {
      //   try {
      //     dispatch({ type: GET_EXPANDER });

      //     const res = await axios.get("http://localhost:2000/api/expander");
      //     dispatch({
      //       type: GET_EXPANDER_SUCCESS,
      //       payload: res.data
      //     });
      //   } catch (err) {
      //     console.log(err);
      //   }
      // });
    } catch (err) {
      dispatch({ type: EXPANDER_ERROR, payload: err });
      setAlert(
        "",
        "",
        "Login-Berrechtigung ist abgelaufen. Bitte melde dich erneut an."
      );
    }
  };

  // CLEAR_EXPANDER
  const clearExpander = () => {
    dispatch({
      type: CLEAR_EXPANDER
    });
  };

  // SELECT_EXPANDER_ITEM
  const selectExpanderItem = item => {
    dispatch({
      type: SELECT_EXPANDER_ITEM,
      payload: item
    });
  };

  // LOCK_EXPANDER_EDITOR
  const lockEditor = boolean => {
    dispatch({
      type: LOCK_EXPANDER_EDITOR,
      payload: boolean
    });
  };

  // SET_EDITOR_STATE
  const setExpanderEditor = state => {
    dispatch({
      type: SET_EXPANDER_EDITOR,
      payload: state
    });
  };

  return (
    <ExpanderContext.Provider
      value={{
        expanderUserData: state.expanderUserData,
        loading: state.loading,
        error: state.error,
        selectedExpanderItem: state.selectedExpanderItem,
        expanderEditorState: state.expanderEditorState, // expanderEditorState === ContentState !!
        getExpander,
        addExpanderItem,
        deleteExpander,
        updateExpander,
        clearExpander,
        selectExpanderItem,
        lockEditor,
        setExpanderEditor,
        editorLocked: state.editorLocked
      }}
    >
      {props.children}
    </ExpanderContext.Provider>
  );
};

export default ExpanderState;
