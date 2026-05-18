import { PersistConfig, persistReducer } from "redux-persist";
import { getType } from "typesafe-actions";
import createSecureStorage from "../../../../../../store/storages/secureStorage";
import { Action } from "../../../../../../store/actions/types";
import {
  itwGrantProximityConsent,
  itwRevokeProximityConsentByKey,
  itwRevokeProximityConsentsByCredentialType
} from "../actions";
import { itwLifecycleStoresReset } from "../../../../lifecycle/store/actions";
import { itwCredentialsRemoveByType } from "../../../../credentials/store/actions";
import { ConsentData } from "../types";
import { generateConsentKey } from "../utils";

export type ItwProximityState = {
  consents: Record<string, ConsentData>;
};

export const itwProximityInitialState: ItwProximityState = {
  consents: {}
};

/**
 * Filters out all consents that involve the specified credential type.
 */
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

const reducer = (
  state: ItwProximityState = itwProximityInitialState,
  action: Action
): ItwProximityState => {
  switch (action.type) {
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

    case getType(itwCredentialsRemoveByType): {
      return {
        ...state,
        consents: filterConsentsByCredentialType(state.consents, action.payload)
      };
    }

    case getType(itwLifecycleStoresReset):
      return itwProximityInitialState;

    default:
      return state;
  }
};

const CURRENT_REDUX_ITW_PROXIMITY_STORE_VERSION = -1;

const itwProximityPersistConfig: PersistConfig = {
  key: "itwProximity",
  storage: createSecureStorage(),
  version: CURRENT_REDUX_ITW_PROXIMITY_STORE_VERSION
};

export const itwProximityReducer = reducer;

const persistedReducer = persistReducer(itwProximityPersistConfig, reducer);

export default persistedReducer;
