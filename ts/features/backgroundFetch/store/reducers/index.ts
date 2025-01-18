import { BackgroundFetchStatus } from "react-native-background-fetch";
import { getType } from "typesafe-actions";
import { Action } from "../../../../store/actions/types";
import { backgroundFetchUpdateStatus } from "../actions";

export type BackgroundFetchState = {
  status: BackgroundFetchStatus | undefined;
};

export const backgroundFetchInitialState: BackgroundFetchState = {
  status: undefined
};

export const backgroundFetchReducer = (
  state: BackgroundFetchState = backgroundFetchInitialState,
  action: Action
): BackgroundFetchState => {
  switch (action.type) {
    case getType(backgroundFetchUpdateStatus):
      return {
        ...state,
        status: action.payload
      };
    default:
      return state;
  }
};
