import { getType } from "typesafe-actions";
import { Action } from "../../../../store/actions/types";
import { setConnectionStatus } from "../actions";

// Define the type for the connection state
export type ConnectivityState = {
  isConnected?: boolean;
};

// Define the initial state
// add unefined state in order to manage the initially value (before dispatch setConnectionStatus)
const initialState: ConnectivityState = {
  isConnected: undefined
};

// Define the reducer
const connectivityStateReducer = (
  state: ConnectivityState = initialState,
  action: Action
): ConnectivityState => {
  switch (action.type) {
    case getType(setConnectionStatus):
      return {
        ...state,
        isConnected: action.payload
      };
    default:
      return state;
  }
};

export default connectivityStateReducer;
