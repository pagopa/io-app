import { ItwConfig } from "@io-app/api-types/generated/definitions/content/ItwConfig";
import { PersistConfig, persistReducer } from "redux-persist";
import { getType } from "typesafe-actions";

import { backendStatusLoadSuccess } from "../../../../../store/actions/backendStatus";
import { Action } from "../../../../../store/actions/types";
import createSecureStorage from "../../../../../store/storages/secureStorage";

export type ItwRemoteConfigState = ItwConfig;

export const itwRemoteConfigInitialState: ItwRemoteConfigState = {
  enabled: true,
  min_app_version: {
    ios: "0.0.0.0",
    android: "0.0.0.0"
  },
  feedback_banner_visible: false,
  ipatente_cta_visible: false
};

const reducer = (
  state: ItwRemoteConfigState = itwRemoteConfigInitialState,
  action: Action
): ItwRemoteConfigState => {
  switch (action.type) {
    case getType(backendStatusLoadSuccess):
      return action.payload.config.itw;
    default:
      return state;
  }
};

const CURRENT_REDUX_ITW_REMOTE_CONFIG_STORE_VERSION = -1;

const itwCredentialsPersistConfig: PersistConfig = {
  key: "itWalletRemoteConfig",
  storage: createSecureStorage(),
  version: CURRENT_REDUX_ITW_REMOTE_CONFIG_STORE_VERSION
};

const persistedReducer = persistReducer(itwCredentialsPersistConfig, reducer);

export default persistedReducer;
