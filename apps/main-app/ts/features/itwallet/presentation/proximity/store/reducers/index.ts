import { PersistConfig, persistReducer } from "redux-persist";
import { getType } from "typesafe-actions";

import { Action } from "../../../../../../store/actions/types";
import createSecureStorage from "../../../../../../store/storages/secureStorage";
import { itwCredentialsRemove } from "../../../../credentials/store/actions";
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
    case getType(itwCredentialsRemove): {
      const removedCredentialTypes = new Set(
        action.payload.map(({ credentialType }) => credentialType)
      );

      return removedCredentialTypes.size > 0
        ? {
            ...state,
            consents: filterConsentsByCredentialTypes(
              state.consents,
              removedCredentialTypes
            )
          }
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
        consents: filterConsentsByCredentialTypes(
          state.consents,
          new Set([action.payload])
        )
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
 * Filters out all consents that involve any of the specified credential types.
 */
const filterConsentsByCredentialTypes = (
  consents: Record<string, StoredConsentData>,
  credentialTypes: ReadonlySet<string>
): Record<string, StoredConsentData> =>
  Object.fromEntries(
    Object.entries(consents).filter(
      ([, consent]) =>
        !consent.credentials.some(({ credentialType }) =>
          credentialTypes.has(credentialType)
        )
    )
  );

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
