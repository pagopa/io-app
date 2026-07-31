import { GlobalState } from "../../../../../store/reducers/types";
import { CredentialValidity } from "../../../common/utils/itwTypesUtils";
import { itwAllStoredCredentialsSelector } from "../../../credentials/store/selectors";

/**
 * Collects the Status List URIs referenced by all current owners
 * (credentials, Wallet Instance Attestations, Wallet Unit Attestations).
 *
 * Returns `undefined` when owner metadata does not yet expose Status List
 * references, so that startup coherence can distinguish "no owners exist"
 * from "owner metadata not available" and avoid wiping the cache.
 *
 * TODO: [SIW-2162] Wire actual URI extraction once owner types expose
 * Status List references in their Redux state.
 */
export const itwStatusListReferencedUrisSelector = (
  state: GlobalState
): ReadonlyArray<string> => {
  const credentials = itwAllStoredCredentialsSelector(state);
  return credentials
    .filter(c => c.validity?.type === "status_list")
    .map(c => (c.validity as CredentialValidity).statusList.uri);
};
