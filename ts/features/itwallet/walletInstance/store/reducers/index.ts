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
import createSecureStorage from "../../../../../store/storages/secureStorage";
import { itwLifecycleStoresReset } from "../../../lifecycle/store/actions";
import {
  itwWalletInstanceAttestationStore,
  itwUpdateWalletInstanceStatus,
  itwSetWalletInstanceRenewalError,
  itwWalletUnitAttestationsStore,
  itwWalletUnitAttestationsRemoveById
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
  /**
   * Whether a wallet instance renewal has already failed.
   * Used to prevent re-entering the recovery block on subsequent actor retries.
   */
  renewalError: boolean;
  /**
   * Record of Wallet Unit Attestations keyed by ID. They are not stored on
   * credentials to avoid duplication (one WUA might contain multiple keys)
   * and to avoid bloating the stored credential unnecessarily.
   */
  walletUnitAttestations: Record<string, string>;
};

export const itwWalletInstanceInitialState: ItwWalletInstanceState = {
  attestation: undefined,
  status: pot.none,
  renewalError: false,
  walletUnitAttestations: {}
};

type MigrationState = PersistedState & Record<string, any>;

const CURRENT_REDUX_ITW_WALLET_INSTANCE_STORE_VERSION = 3;

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
  }),
  // Add Wallet Unit Attestations
  "3": (state: MigrationState) => ({
    ...state,
    walletUnitAttestations: {}
  })
};

const reducer = (
  state: ItwWalletInstanceState = itwWalletInstanceInitialState,
  action: Action
): ItwWalletInstanceState => {
  switch (action.type) {
    case getType(itwWalletInstanceAttestationStore): {
      return {
        ...state,
        status: pot.none,
        attestation: action.payload,
        renewalError: false
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

    case getType(itwSetWalletInstanceRenewalError):
      return {
        ...state,
        renewalError: action.payload
      };

    case getType(itwWalletUnitAttestationsStore): {
      return {
        ...state,
        walletUnitAttestations: {
          ...state.walletUnitAttestations,
          ...action.payload
        }
      };
    }

    case getType(itwWalletUnitAttestationsRemoveById): {
      return {
        ...state,
        walletUnitAttestations: Object.fromEntries(
          Object.entries(state.walletUnitAttestations).filter(
            ([id]) => !action.payload.includes(id)
          )
        )
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
  storage: createSecureStorage(),
  version: CURRENT_REDUX_ITW_WALLET_INSTANCE_STORE_VERSION,
  migrate: createMigrate(migrations, { debug: isDevEnv })
};

const persistedReducer = persistReducer(
  itwWalletInstancePersistConfig,
  reducer
);

export default persistedReducer;
