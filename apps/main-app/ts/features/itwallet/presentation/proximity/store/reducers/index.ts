import { PersistConfig, persistReducer } from "redux-persist";
import { getType } from "typesafe-actions";

import { Action } from "../../../../../../store/actions/types";
import createSecureStorage from "../../../../../../store/storages/secureStorage";
import { itwCredentialsRemoveByType } from "../../../../credentials/store/actions";
import { itwLifecycleStoresReset } from "../../../../lifecycle/store/actions";
import {
  itwGrantProximityConsent,
  itwRevokeProximityConsentByKey,
  itwRevokeProximityConsentsByCredentialType,
  itwRevokeProximityConsentsByRpId
} from "../actions";
import { ConsentData, ProximityConsents } from "../types";
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
      return {
        ...state,
        consents: filterConsentsByCredentialType(state.consents, action.payload)
      };
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

/** Filters out all consents that involve the specified credential type. */
const filterConsentsByCredentialType = (
  consents: Record<string, ConsentData>,
  credentialType: string
): Record<string, ConsentData> =>
  Object.fromEntries(
    Object.entries(consents).filter(
      ([, consent]) =>
        !consent.credentials.some(c => c.credentialType === credentialType)
    )
  );

/** Filters out all consents given to the specified RP ID. */
const filterConsentsByRpId = (
  consents: Record<string, ConsentData>,
  rpId: string
): Record<string, ConsentData> =>
  Object.fromEntries(
    Object.entries(consents).filter(([, consent]) => consent.rpId !== rpId)
  );

const CURRENT_REDUX_ITW_PROXIMITY_STORE_VERSION = -1;

const itwProximityPersistConfig: PersistConfig = {
  key: "itwProximity",
  storage: createSecureStorage(),
  version: CURRENT_REDUX_ITW_PROXIMITY_STORE_VERSION
};

export const itwProximityReducer = reducer;

const persistedReducer = persistReducer(itwProximityPersistConfig, reducer);

export default persistedReducer;
