import { getType } from "typesafe-actions";
import { PersistConfig, persistReducer } from "redux-persist";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Action } from "../../../../store/actions/types";
import {
  appReviewNegativeFeedback,
  appReviewPositiveFeedback,
  clearFeedbackDatas,
  TopicKeys
} from "../actions";
import {
  logoutFailure,
  logoutSuccess
} from "../../../authentication/common/store/actions";

// String formats for the dates represents the log to be persisted to check the last feedback request time
// both fields are updated directly from reducer on action dispatch and not from the action payload.
export type AppFeedbackState = {
  positiveFeedbackDate: string;
  negativeFeedbackDate:
    | Record<TopicKeys, string | undefined>
    | Record<string, never>;
};

export const appFeedbackInitialState: AppFeedbackState = {
  positiveFeedbackDate: "",
  negativeFeedbackDate: {}
};

const appFeedbackReducer = (
  state: AppFeedbackState = appFeedbackInitialState,
  action: Action
): AppFeedbackState => {
  switch (action.type) {
    case getType(logoutSuccess):
    case getType(logoutFailure):
    case getType(clearFeedbackDatas):
      return {
        ...state,
        ...appFeedbackInitialState
      };
    case getType(appReviewPositiveFeedback):
      return {
        ...state,
        positiveFeedbackDate: new Date().toISOString()
      };
    case getType(appReviewNegativeFeedback):
      return {
        ...state,
        negativeFeedbackDate: {
          ...state.negativeFeedbackDate,
          [action.payload]: new Date().toISOString()
        } as Record<TopicKeys, string | undefined>
      };
    default:
      return state;
  }
};

export const persistConfig: PersistConfig = {
  key: "appFeedback",
  storage: AsyncStorage
};

export const appFeedbackPersistor = persistReducer<AppFeedbackState, Action>(
  persistConfig,
  appFeedbackReducer
);
