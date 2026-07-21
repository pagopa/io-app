import { createSelector } from "reselect";

import { GlobalState } from "../../../../../../store/reducers/types";
import { ConsentData, StoredConsentData } from "../types";
import { generateConsentKey } from "../utils";

/**
 * Returns all proximity presentation consents as a record keyed by consent key.
 */
export const itwProximityConsentsRecordSelector = (state: GlobalState) =>
  state.features.itWallet.proximity.consents;

/**
 * Returns all proximity presentation consents as a flat array.
 */
export const itwProximityConsentsSelector = createSelector(
  itwProximityConsentsRecordSelector,
  (consents): ReadonlyArray<StoredConsentData> => Object.values(consents)
);

/**
 * Returns all proximity presentation consents with their generated keys.
 */
export const itwProximityConsentsEntriesSelector = createSelector(
  itwProximityConsentsRecordSelector,
  consents => Object.entries(consents)
);

/**
 * Returns consent entries involving the requested credential type, ordered by
 * most recent save time. Legacy entries without a timestamp are kept last.
 */
export const itwProximityConsentsEntriesByCredentialTypeSelector = (
  credentialType: string
) =>
  createSelector(itwProximityConsentsEntriesSelector, entries =>
    entries
      .filter(([, consent]) =>
        consent.credentials.some(c => c.credentialType === credentialType)
      )
      .sort(([, firstConsent], [, secondConsent]) => {
        if (firstConsent.savedAt && secondConsent.savedAt) {
          return secondConsent.savedAt.localeCompare(firstConsent.savedAt);
        }
        if (firstConsent.savedAt) {
          return -1;
        }
        if (secondConsent.savedAt) {
          return 1;
        }
        return 0;
      })
  );

/** Returns a stored proximity consent by its deterministic key. */
export const itwProximityConsentByKeySelector = (consentKey: string) =>
  createSelector(
    itwProximityConsentsRecordSelector,
    consents => consents[consentKey]
  );

/**
 * Returns whether consent management should be available for a credential.
 */
export const itwProximityShouldShowConsentManagementSelector = (
  credentialType: string
) =>
  createSelector(itwProximityConsentsSelector, consents =>
    consents.some(consent =>
      consent.credentials.some(
        credential => credential.credentialType === credentialType
      )
    )
  );

/**
 * Returns all consents that involve the specified credential type.
 */
export const itwProximityConsentsByCredentialTypeSelector = (
  credentialType: string
) =>
  createSelector(
    itwProximityConsentsSelector,
    (consents): ReadonlyArray<StoredConsentData> =>
      consents.filter(consent =>
        consent.credentials.some(c => c.credentialType === credentialType)
      )
  );

/**
 * Returns whether a consent with the exact same RP, credential types,
 * and claim names combination already exists.
 */
export const itwProximityConsentExistsSelector = (consentData: ConsentData) =>
  createSelector(itwProximityConsentsRecordSelector, (consents): boolean => {
    const key = generateConsentKey(consentData);
    return key in consents;
  });

/**
 * Returns all consents given to the specified Relying Party.
 */
export const itwProximityConsentsByRpIdSelector = (rpId: string) =>
  createSelector(
    itwProximityConsentsSelector,
    (consents): ReadonlyArray<StoredConsentData> =>
      consents.filter(consent => consent.rpId === rpId)
  );
