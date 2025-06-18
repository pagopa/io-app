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
import {
  WalletInstanceStatus,
  WalletInstanceAttestations
} from "../../../common/utils/itwTypesUtils";
import { NetworkError } from "../../../../../utils/errors";
import { isDevEnv } from "../../../../../utils/environment";

export type ItwWalletInstanceState = {
  /**
   * The new Wallet Attestation in multiple formats
   */
  attestation: WalletInstanceAttestations | undefined;
  /**
   * The Wallet Instance status fetched from the Wallet Provider backend
   */
  status: pot.Pot<WalletInstanceStatus, NetworkError>;
};

export const itwWalletInstanceInitialState: ItwWalletInstanceState = {
  attestation: undefined,
  status: pot.none
};

type MigrationState = PersistedState & Record<string, any>;

const CURRENT_REDUX_ITW_WALLET_INSTANCE_STORE_VERSION = 1;

export const migrations: MigrationManifest = {
  // Convert status into a pot for better async handling
  "0": (state: MigrationState) => ({
    ...state,
    status: state.status ? pot.some(state.status) : pot.none
  }),
  // Move the old Wallet Attestation into the new structure
  "1": (state: MigrationState) => ({
    ...state,
    attestation: {
      jwt: state.attestation
    }
  })
};

const reducer = (
  state: ItwWalletInstanceState = itwWalletInstanceInitialState,
  action: Action
): ItwWalletInstanceState => {
  switch (action.type) {
    case getType(itwWalletInstanceAttestationStore): {
      return {
        status: pot.none,
        attestation: action.payload
      };
    }

    case getType(itwUpdateWalletInstanceStatus.success): {
      return {
        ...state,
        status: pot.some(action.payload)
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
