import { getType } from "typesafe-actions";
import { PersistConfig, persistReducer } from "redux-persist";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Action } from "../../../../store/actions/types";
import { AppFeedbackUriFeature } from "../../../../../definitions/content/AppFeedbackUriFeature";
import { appReviewNegFeedback, appReviewPositiveFeedback } from "../actions";

export type AppFeedbackState = {
  positiveFeedbackLog: string;
  negativeFeedback:
    | Record<keyof AppFeedbackUriFeature, string | undefined>
    | Record<string, never>;
};

export const appFeedbackInitialState: AppFeedbackState = {
  positiveFeedbackLog: "",
  negativeFeedback: {}
};

const appFeedbackReducer = (
  state: AppFeedbackState = appFeedbackInitialState,
  action: Action
): AppFeedbackState => {
  switch (action.type) {
    case getType(appReviewPositiveFeedback):
      return {
        ...state,
        positiveFeedbackLog: new Date().toISOString()
      };
    case getType(appReviewNegFeedback):
      return {
        ...state,
        negativeFeedback: {
          ...state.negativeFeedback,
          [action.payload]: new Date().toISOString()
        } as Record<keyof AppFeedbackUriFeature, string | undefined>
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
