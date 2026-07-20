import { createMigrate, PersistConfig, persistReducer } from "redux-persist";
import { getType } from "typesafe-actions";

import { Action } from "../../../../../../store/actions/types";
import createSecureStorage from "../../../../../../store/storages/secureStorage";
import { isDevEnv } from "../../../../../../utils/environment";
import {
  itwCredentialsRemoveByType,
  itwCredentialsReplaceByType
} from "../../../../credentials/store/actions";
import { itwLifecycleStoresReset } from "../../../../lifecycle/store/actions";
import {
  itwGrantProximityConsent,
  itwRevokeProximityConsentByKey,
  itwRevokeProximityConsentsByCredentialType,
  itwRevokeProximityConsentsByRpId
} from "../actions";
import {
  ConsentManagementCredentialTypes,
  ProximityConsents,
  StoredConsentData
} from "../types";
import { generateConsentKey } from "../utils";
import {
  CURRENT_REDUX_ITW_PROXIMITY_STORE_VERSION,
  itwProximityStateMigrations
} from "./migrations";

export type ItwProximityState = {
  consentManagementCredentialTypes: ConsentManagementCredentialTypes;
  consents: ProximityConsents;
};

export const itwProximityInitialState: ItwProximityState = {
  consentManagementCredentialTypes: {},
  consents: {}
};

const reducer = (
  state: ItwProximityState = itwProximityInitialState,
  action: Action
): ItwProximityState => {
  switch (action.type) {
    case getType(itwCredentialsRemoveByType): {
      return removeCredentialTypeData(state, action.payload);
    }

    case getType(itwCredentialsReplaceByType): {
      const credentialType = action.payload[0]?.metadata.credentialType;
      return credentialType
        ? removeCredentialTypeData(state, credentialType)
        : state;
    }

    case getType(itwGrantProximityConsent): {
      const consentData = action.payload;
      const key = generateConsentKey(consentData);

      // No-op if the consent already exists
      if (state.consents[key]) {
        return state;
      }

      return {
        ...state,
        consentManagementCredentialTypes: action.payload.credentials.reduce(
          (credentialTypes, { credentialType }) => ({
            ...credentialTypes,
            [credentialType]: true
          }),
          state.consentManagementCredentialTypes
        ),
        consents: {
          ...state.consents,
          [key]: consentData
        }
      };
    }

    case getType(itwLifecycleStoresReset):
      return itwProximityInitialState;

    case getType(itwRevokeProximityConsentByKey): {
      const { [action.payload]: _, ...remaining } = state.consents;
      return {
        ...state,
        consents: remaining
      };
    }

    case getType(itwRevokeProximityConsentsByCredentialType): {
      return {
        ...state,
        consents: filterConsentsByCredentialType(state.consents, action.payload)
      };
    }

    case getType(itwRevokeProximityConsentsByRpId): {
      return {
        ...state,
        consents: filterConsentsByRpId(state.consents, action.payload)
      };
    }

    default:
      return state;
  }
};

/**
 * Filters out all consents that involve the specified credential type.
 */
const filterConsentsByCredentialType = (
  consents: Record<string, StoredConsentData>,
  credentialType: string
): Record<string, StoredConsentData> =>
  Object.fromEntries(
    Object.entries(consents).filter(
      ([, consent]) =>
        !consent.credentials.some(c => c.credentialType === credentialType)
    )
  );

/** Removes consent data and its management marker for a credential type. */
const removeCredentialTypeData = (
  state: ItwProximityState,
  credentialType: string
): ItwProximityState => {
  const { [credentialType]: _, ...remainingCredentialTypes } =
    state.consentManagementCredentialTypes;

  return {
    ...state,
    consentManagementCredentialTypes: remainingCredentialTypes,
    consents: filterConsentsByCredentialType(state.consents, credentialType)
  };
};

/**
 * Filters out all consents given to the specified RP ID.
 */
const filterConsentsByRpId = (
  consents: Record<string, StoredConsentData>,
  rpId: string
): Record<string, StoredConsentData> =>
  Object.fromEntries(
    Object.entries(consents).filter(([, consent]) => consent.rpId !== rpId)
  );

const itwProximityPersistConfig: PersistConfig = {
  key: "itwProximity",
  storage: createSecureStorage(),
  version: CURRENT_REDUX_ITW_PROXIMITY_STORE_VERSION,
  migrate: createMigrate(itwProximityStateMigrations, { debug: isDevEnv })
};

export const itwProximityReducer = reducer;

const persistedReducer = persistReducer(itwProximityPersistConfig, reducer);

export default persistedReducer;
