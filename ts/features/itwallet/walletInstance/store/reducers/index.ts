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
  WiaFormat
} from "../../../common/utils/itwTypesUtils";
import { NetworkError } from "../../../../../utils/errors";
import { isDevEnv } from "../../../../../utils/environment";

export type ItwWalletInstanceState = {
  /**
   * @deprecated Will be removed in future releases
   *
   * Legacy Wallet Attestation in JWT format
   */
  attestation: string | undefined;
  /**
   * The new Wallet Attestation in multiple formats
   */
  walletAttestation: Record<WiaFormat, string> | undefined;
  /**
   * The Wallet Instance status fetched from the Wallet Provider backend
   */
  status: pot.Pot<WalletInstanceStatus, NetworkError>;
};

export const itwWalletInstanceInitialState: ItwWalletInstanceState = {
  attestation: undefined,
  walletAttestation: undefined,
  status: pot.none
};

const CURRENT_REDUX_ITW_WALLET_INSTANCE_STORE_VERSION = 1;

const migrations: MigrationManifest = {
  // Convert status into a pot for better async handling
  "0": state => {
    const prevState = state as PersistedState & {
      attestation: string | undefined;
      status: WalletInstanceStatus | undefined;
    };
    return {
      ...prevState,
      status: prevState.status ? pot.some(prevState.status) : pot.none
    };
  },
  // Add the new Wallet Attestation in different formats
  "1": state => {
    const prevState = state as PersistedState & {
      attestation: string | undefined;
      status: pot.Pot<WalletInstanceStatus, NetworkError>;
    };
    return {
      ...prevState,
      walletAttestation: undefined
    };
  }
};

const reducer = (
  state: ItwWalletInstanceState = itwWalletInstanceInitialState,
  action: Action
): ItwWalletInstanceState => {
  switch (action.type) {
    case getType(itwWalletInstanceAttestationStore): {
      // Legacy attestation
      if (typeof action.payload === "string") {
        return {
          ...state,
          status: pot.none,
          attestation: action.payload
        };
      }
      return {
        ...state,
        status: pot.none,
        walletAttestation: action.payload.reduce(
          (acc, { format, wallet_attestation }) => ({
            ...acc,
            [format]: wallet_attestation
          }),
          {} as Record<WiaFormat, string>
        )
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
