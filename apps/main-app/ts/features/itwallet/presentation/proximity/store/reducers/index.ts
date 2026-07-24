import { PersistConfig, persistReducer } from "redux-persist";
import { getType } from "typesafe-actions";

import { Action } from "../../../../../../store/actions/types";
import createSecureStorage from "../../../../../../store/storages/secureStorage";
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
import { ProximityConsents, StoredConsentData } from "../types";
import { generateConsentKey } from "../utils";

export type ItwProximityState = {
  consents: ProximityConsents;
};

export const itwProximityInitialState: ItwProximityState = {
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
        consents: {
          ...state.consents,
          [key]: {
            ...consentData,
            savedAt: new Date().toISOString()
          }
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

/** Removes consent data for a credential type. */
const removeCredentialTypeData = (
  state: ItwProximityState,
  credentialType: string
): ItwProximityState => ({
  ...state,
  consents: filterConsentsByCredentialType(state.consents, credentialType)
});

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
  version: -1
};

export const itwProximityReducer = reducer;

const persistedReducer = persistReducer(itwProximityPersistConfig, reducer);

export default persistedReducer;
