import AsyncStorage from "@react-native-async-storage/async-storage";
import { getType } from "typesafe-actions";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { PersistConfig, persistReducer } from "redux-persist";
import { Action } from "../../../../store/actions/types";
import { GlobalState } from "../../../../store/reducers/types";
import {
  disableWhatsNew,
  enableWhatsNewCheck,
  whatsNewDisplayed
} from "../actions";
import { ACTIVE_VERSION } from "../../versions";

export type WhatsNewState = {
  lastVisualizedVersion?: number;
  whatsNewCheckEnabled: boolean;
  isWhatsNewDisplayed: boolean;
};

export const whatsNewInitialState: WhatsNewState = {
  lastVisualizedVersion: undefined,
  whatsNewCheckEnabled: false,
  isWhatsNewDisplayed: false
};

export const isActiveVersionVisualizedWhatsNewSelector = (
  state: GlobalState
): boolean =>
  pipe(
    state.features.whatsNew.lastVisualizedVersion,
    O.fromNullable,
    O.fold(
      () => false,
      lastVisualizedVersion => lastVisualizedVersion >= ACTIVE_VERSION
    )
  );

export const isWhatsNewCheckEnabledSelector = (state: GlobalState): boolean =>
  state.features.whatsNew.whatsNewCheckEnabled;

export const isWhatsNewDisplayedSelector = (state: GlobalState): boolean =>
  state.features.whatsNew.isWhatsNewDisplayed;

export const whatsNewReducer = (
  state: WhatsNewState = whatsNewInitialState,
  action: Action
): WhatsNewState => {
  switch (action.type) {
    case getType(disableWhatsNew):
      return {
        lastVisualizedVersion: action.payload.whatsNewVersion,
        whatsNewCheckEnabled: false,
        isWhatsNewDisplayed: false
      };
    case getType(enableWhatsNewCheck):
      return {
        ...state,
        whatsNewCheckEnabled: true
      };
    case getType(whatsNewDisplayed):
      return {
        ...state,
        isWhatsNewDisplayed: true
      };
  }
  return state;
};

// TODO: lastVisualizedVersion will be saved in user profile. Jira ticket: IOPID-424
const CURRENT_REDUX_FEATURES_STORE_VERSION = -1;

const persistConfig: PersistConfig = {
  key: "whatsNew",
  storage: AsyncStorage,
  version: CURRENT_REDUX_FEATURES_STORE_VERSION,
  whitelist: ["lastVisualizedVersion"]
};

export const whatsNewPersistor = persistReducer<WhatsNewState, Action>(
  persistConfig,
  whatsNewReducer
);
