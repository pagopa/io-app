import { createSelector } from "reselect";
import { GlobalState } from "../../../../../../store/reducers/types";
import { ConsentData } from "../types";
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
  (consents): ReadonlyArray<ConsentData> => Object.values(consents)
);

/**
 * Returns all proximity presentation consents as an array of key-value pairs,
 * suitable for rendering lists that need both the consent key (for deletion)
 * and the consent data (for display).
 */
export const itwProximityConsentsEntriesSelector = createSelector(
  itwProximityConsentsRecordSelector,
  (consents): ReadonlyArray<{ key: string; data: ConsentData }> =>
    Object.entries(consents).map(([key, data]) => ({ key, data }))
);

/**
 * Returns all consents that involve the specified credential type.
 */
export const itwProximityConsentsByCredentialTypeSelector = (
  credentialType: string
) =>
  createSelector(
    itwProximityConsentsSelector,
    (consents): ReadonlyArray<ConsentData> =>
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
    (consents): ReadonlyArray<ConsentData> =>
      consents.filter(consent => consent.rpId === rpId)
  );
