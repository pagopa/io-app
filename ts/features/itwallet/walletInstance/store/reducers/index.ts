import * as pot from "@pagopa/ts-commons/lib/pot";
import {
  createMigrate,
  MigrationManifest,
  PersistConfig,
  PersistedState,
  persistReducer
} from "redux-persist";
import { getType } from "typesafe-actions";

import { Action } from "../../../../../store/actions/types";
import createSecureStorage from "../../../../../store/storages/secureStorage";
import { isDevEnv } from "../../../../../utils/environment";
import { NetworkError } from "../../../../../utils/errors";
import {
  WalletInstanceAttestations,
  WalletInstanceStatus
} from "../../../common/utils/itwTypesUtils";
import { itwLifecycleStoresReset } from "../../../lifecycle/store/actions";
import {
  itwSetWalletInstanceRenewalError,
  itwUpdateWalletInstanceStatus,
  itwWalletInstanceAttestationStore
} from "../actions";

export type ItwWalletInstanceState = {
  /**
   * The new Wallet Attestation in multiple formats
   */
  attestation: undefined | WalletInstanceAttestations;
  /**
   * Whether a wallet instance renewal has already failed.
   * Used to prevent re-entering the recovery block on subsequent actor retries.
   */
  renewalError: boolean;
  /**
   * The Wallet Instance status fetched from the Wallet Provider backend
   */
  status: pot.Pot<WalletInstanceStatus, NetworkError>;
};

export const itwWalletInstanceInitialState: ItwWalletInstanceState = {
  attestation: undefined,
  status: pot.none,
  renewalError: false
};

type MigrationState = PersistedState & Record<string, any>;

const CURRENT_REDUX_ITW_WALLET_INSTANCE_STORE_VERSION = 2;

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
  }),
  // Add renewalError field
  "2": (state: MigrationState) => ({
    ...state,
    renewalError: false
  })
};

const reducer = (
  state: ItwWalletInstanceState = itwWalletInstanceInitialState,
  action: Action
): ItwWalletInstanceState => {
  switch (action.type) {
    case getType(itwLifecycleStoresReset):
      return { ...itwWalletInstanceInitialState };

    case getType(itwSetWalletInstanceRenewalError):
      return {
        ...state,
        renewalError: action.payload
      };

    case getType(itwUpdateWalletInstanceStatus.cancel): {
      return {
        ...state,
        status: pot.none
      };
    }

    case getType(itwUpdateWalletInstanceStatus.failure): {
      return {
        ...state,
        status: pot.toError(state.status, action.payload)
      };
    }

    case getType(itwUpdateWalletInstanceStatus.success): {
      return {
        ...state,
        status: pot.some(action.payload)
      };
    }

    case getType(itwWalletInstanceAttestationStore): {
      return {
        status: pot.none,
        attestation: action.payload,
        renewalError: false
      };
    }

    default:
      return state;
  }
};

const itwWalletInstancePersistConfig: PersistConfig = {
  key: "itwWalletInstance",
  storage: createSecureStorage(),
  version: CURRENT_REDUX_ITW_WALLET_INSTANCE_STORE_VERSION,
  migrate: createMigrate(migrations, { debug: isDevEnv })
};

const persistedReducer = persistReducer(
  itwWalletInstancePersistConfig,
  reducer
);

export default persistedReducer;
