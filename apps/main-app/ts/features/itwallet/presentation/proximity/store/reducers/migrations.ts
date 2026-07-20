import { MigrationManifest, PersistedState } from "redux-persist";

import { StoredConsentData } from "../types";

type MigrationState = PersistedState & {
  consents?: Record<string, StoredConsentData>;
};

/** Current persisted proximity-store schema version. */
export const CURRENT_REDUX_ITW_PROXIMITY_STORE_VERSION = 0;

/** Adds consent-management markers to stores persisted before this feature. */
export const itwProximityStateMigrations: MigrationManifest = {
  "0": (state: MigrationState): PersistedState => {
    const consents = state.consents ?? {};
    const consentManagementCredentialTypes = Object.fromEntries(
      Object.values(consents).flatMap(consent =>
        consent.credentials.map(({ credentialType }) => [credentialType, true])
      )
    );

    return {
      ...state,
      consentManagementCredentialTypes
    } as PersistedState;
  }
};
