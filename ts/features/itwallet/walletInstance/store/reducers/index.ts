import {
  MigrationManifest,
  PersistConfig,
  PersistedState,
  createMigrate,
  persistReducer
} from "redux-persist";
import { getType } from "typesafe-actions";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { Action } from "../../../../../store/actions/types";
import itwCreateSecureStorage from "../../../common/store/storages/itwSecureStorage";
import { itwLifecycleStoresReset } from "../../../lifecycle/store/actions";
import {
  itwWalletInstanceAttestationStore,
  itwUpdateWalletInstanceStatus
} from "../actions";
import { WalletInstanceStatus } from "../../../common/utils/itwTypesUtils";
import { NetworkError } from "../../../../../utils/errors";
import { isDevEnv } from "../../../../../utils/environment";

export type ItwWalletInstanceState = {
  attestation: string | undefined;
  status: pot.Pot<WalletInstanceStatus, NetworkError>;
  lastStatusUpdateDate: string | undefined;
};

export const itwWalletInstanceInitialState: ItwWalletInstanceState = {
  attestation: undefined,
  status: pot.none,
  lastStatusUpdateDate: undefined
};

const CURRENT_REDUX_ITW_WALLET_INSTANCE_STORE_VERSION = 0;

const migrations: MigrationManifest = {
  // Convert status into a pot for better async handling
  "0": (state): ItwWalletInstanceState & PersistedState => {
    const prevState = state as PersistedState & {
      attestation: string | undefined;
      status: WalletInstanceStatus | undefined;
      lastStatusUpdateDate: string | undefined;
    };
    return {
      ...prevState,
      status: prevState.status ? pot.some(prevState.status) : pot.none
    };
  }
};

const reducer = (
  state: ItwWalletInstanceState = itwWalletInstanceInitialState,
  action: Action
): ItwWalletInstanceState => {
  switch (action.type) {
    case getType(itwWalletInstanceAttestationStore): {
      return {
        status: pot.none,
        attestation: action.payload,
        lastStatusUpdateDate: new Date().toISOString()
      };
    }

    case getType(itwUpdateWalletInstanceStatus.success): {
      return {
        ...state,
        status: pot.some(action.payload),
        lastStatusUpdateDate: new Date().toISOString()
      };
    }

    case getType(itwUpdateWalletInstanceStatus.failure): {
      return {
        ...state,
        status: pot.toError(state.status, action.payload)
      };
    }

    case getType(itwUpdateWalletInstanceStatus.cancel): {
      return {
        ...state,
        status: pot.none
      };
    }

    case getType(itwLifecycleStoresReset):
      return { ...itwWalletInstanceInitialState };

    default:
      return state;
  }
};

const itwWalletInstancePersistConfig: PersistConfig = {
  key: "itwWalletInstance",
  storage: itwCreateSecureStorage(),
  version: CURRENT_REDUX_ITW_WALLET_INSTANCE_STORE_VERSION,
  migrate: createMigrate(migrations, { debug: isDevEnv })
};

const persistedReducer = persistReducer(
  itwWalletInstancePersistConfig,
  reducer
);

export default persistedReducer;
