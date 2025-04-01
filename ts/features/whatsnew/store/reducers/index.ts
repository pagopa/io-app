import AsyncStorage from "@react-native-async-storage/async-storage";
import { getType } from "typesafe-actions";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { PersistConfig, persistReducer } from "redux-persist";
import { Action } from "../../../../store/actions/types";
import { GlobalState } from "../../../../store/reducers/types";
import { disableWhatsNew } from "../actions";
import { ACTIVE_VERSION } from "../../versions";
import {
  logoutFailure,
  logoutSuccess
} from "../../../authentication/common/store/actions";

export type WhatsNewState = {
  lastVisualizedVersion?: number;
};

export const whatsNewInitialState: WhatsNewState = {
  lastVisualizedVersion: undefined
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

export const whatsNewReducer = (
  state: WhatsNewState = whatsNewInitialState,
  action: Action
): WhatsNewState => {
  switch (action.type) {
    case getType(logoutSuccess):
    case getType(logoutFailure):
      return whatsNewInitialState;
    case getType(disableWhatsNew):
      return {
        lastVisualizedVersion: action.payload.whatsNewVersion
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
