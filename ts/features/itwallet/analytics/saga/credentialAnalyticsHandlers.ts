import { SagaIterator } from "redux-saga";
import { select } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import {
  itwCredentialsStore,
  itwCredentialsRemove
} from "../../credentials/store/actions";
import { itwLifecycleIsITWalletValidSelector } from "../../lifecycle/store/selectors";
import {
  updateCredentialAddedProperties,
  updateCredentialDeletedProperties,
  updateItwStatusAndPIDProperties
} from "../properties/propertyUpdaters";
import { getMixPanelCredential } from "../utils/analyticsUtils";
import { MixPanelCredential } from "..";
import { StoredCredential } from "../../common/utils/itwTypesUtils";
import { GlobalState } from "../../../../store/reducers/types";

const MIXPANEL_EID_CREDENTIALS: ReadonlySet<MixPanelCredential> = new Set([
  "ITW_PID",
  "ITW_ID_V2"
]);

/**
 * Handles analytics updates when an ITW credential is stored.
 */
export function* handleCredentialStoredAnalytics(
  action: ActionType<typeof itwCredentialsStore>
): SagaIterator {
  const state: GlobalState = yield* select();
  const isItwL3 = itwLifecycleIsITWalletValidSelector(state);

  const credential = getAnalyticsCredentialFromStored(action.payload, isItwL3);

  if (!credential) {
    return;
  }

  if (MIXPANEL_EID_CREDENTIALS.has(credential)) {
    updateItwStatusAndPIDProperties(state);
    return;
  }

  updateCredentialAddedProperties(credential);
}

/**
 * Handles analytics updates when an ITW credential is removed.
 */
export function* handleCredentialRemovedAnalytics(
  action: ActionType<typeof itwCredentialsRemove>
): SagaIterator {
  const isItwL3 = yield* select(itwLifecycleIsITWalletValidSelector);

  const credential = getAnalyticsCredentialFromStored(action.payload, isItwL3);

  if (!credential) {
    return;
  }

  /**
   * During ITW upgrade, eID (ID_V2) is removed from the store
   * but must NOT be marked as deleted in analytics.
   * In case of wallet revocation, all analytics properties are
   * already reset by updatePropertiesWalletRevoked.
   */
  if (MIXPANEL_EID_CREDENTIALS.has(credential)) {
    return;
  }

  updateCredentialDeletedProperties(credential);
}

function getAnalyticsCredentialFromStored(
  credentials: ReadonlyArray<StoredCredential>,
  isItwL3: boolean
): MixPanelCredential | undefined {
  if (credentials.length === 0) {
    return;
  }

  // Credentials may differ by format but not by type.
  // Using the first element is sufficient for analytics.
  const { credentialType } = credentials[0];

  return getMixPanelCredential(credentialType, isItwL3);
}
