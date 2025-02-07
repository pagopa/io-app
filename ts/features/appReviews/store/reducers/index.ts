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

const persistConfig: PersistConfig = {
  key: "appFeedback",
  storage: AsyncStorage
};

export const appFeedbackPersistor = persistReducer<AppFeedbackState, Action>(
  persistConfig,
  appFeedbackReducer
);
