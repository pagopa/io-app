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
  itwKeyAttestationsRemoveById,
  itwKeyAttestationsStore,
  itwSetWalletInstanceRemotelyActive,
  itwSetWalletInstanceRenewalError,
  itwStoreWalletInstanceStatusList,
  itwUpdateWalletInstanceStatus,
  itwWalletInstanceAttestationStore
} from "../actions";

export type ItwWalletInstanceState = {
  /**
   * The new Wallet Attestation in multiple formats
   */
  attestation: undefined | WalletInstanceAttestations;
  /**
   * Indicates whether the user has an already active wallet instance
   * but the actual local wallet is not active.
   */
  isRemotelyActive: boolean | undefined;
  /**
   * Record of Key Attestations keyed by ID. They are not stored on
   * credentials to avoid duplication (one KA might contain multiple keys)
   * and to avoid bloating the stored credential unnecessarily.
   */
  keyAttestations: Record<string, string>;
  /**
   * Whether a wallet instance renewal has already failed.
   * Used to prevent re-entering the recovery block on subsequent actor retries.
   */
  renewalError: boolean;
  /**
   * The Wallet Instance status fetched from the Wallet Provider backend
   */
  status: pot.Pot<WalletInstanceStatus, NetworkError>;
  /**
   * [1.3.3+] The Status List entry for the wallet instance, if available.
   * This is used to check the validity of the wallet instance.
   */
  statusList: undefined | { idx: number; uri: string };
};

export const itwWalletInstanceInitialState: ItwWalletInstanceState = {
  attestation: undefined,
  isRemotelyActive: undefined,
  keyAttestations: {},
  renewalError: false,
  status: pot.none,
  statusList: undefined
};

type MigrationState = PersistedState & Record<string, any>;

const CURRENT_REDUX_ITW_WALLET_INSTANCE_STORE_VERSION = 6;

export const migrations: MigrationManifest = {
  // Convert status into a pot for better async handling
  "0": (state: MigrationState) => ({
    ...state,
    status: state.status !== undefined ? pot.some(state.status) : pot.none
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
  }),
  // Add isRemotelyActive
  "4": (state: MigrationState) => ({
    ...state,
    isRemotelyActive: undefined
  }),
  // Add statusList
  "5": (state: MigrationState) => ({
    ...state,
    isRemotelyActive: undefined
  }),
  // Migrate walletUnitAttestations to keyAttestations
  "6": (state: MigrationState) => ({
    ...state,
    keyAttestations: state.walletUnitAttestations ?? {},
    walletUnitAttestations: undefined
  })
};

const reducer = (
  state: ItwWalletInstanceState = itwWalletInstanceInitialState,
  action: Action
): ItwWalletInstanceState => {
  switch (action.type) {
    case getType(itwKeyAttestationsRemoveById): {
      return {
        ...state,
        keyAttestations: Object.fromEntries(
          Object.entries(state.keyAttestations).filter(
            ([id]) => !action.payload.includes(id)
          )
        )
      };
    }

    case getType(itwKeyAttestationsStore): {
      return {
        ...state,
        keyAttestations: {
          ...state.keyAttestations,
          ...action.payload
        }
      };
    }

    case getType(itwLifecycleStoresReset):
      return {
        ...itwWalletInstanceInitialState,
        // Should be persisted on wallet resets
        isRemotelyActive: state.isRemotelyActive
      };

    case getType(itwSetWalletInstanceRemotelyActive): {
      return {
        ...state,
        isRemotelyActive: action.payload
      };
    }

    case getType(itwSetWalletInstanceRenewalError):
      return {
        ...state,
        renewalError: action.payload
      };

    case getType(itwStoreWalletInstanceStatusList): {
      return {
        ...state,
        statusList: action.payload
      };
    }

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
        ...state,
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
  migrate: createMigrate(migrations, { debug: isDevEnv }),
  blacklist: ["isRemotelyActive"] satisfies Array<keyof ItwWalletInstanceState>
};

const persistedReducer = persistReducer(
  itwWalletInstancePersistConfig,
  reducer
);

export default persistedReducer;
