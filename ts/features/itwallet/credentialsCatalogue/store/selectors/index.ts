import * as pot from "@pagopa/ts-commons/lib/pot";
import { isAfter } from "date-fns";
import { GlobalState } from "../../../../../store/reducers/types";

/**
 * Select the last fetched credentials catalogue.
 * **Note:** the catalogue may be stale.
 */
export const itwCredentialsCatalogueSelector = (state: GlobalState) =>
  pot.toUndefined(state.features.itWallet.credentialsCatalogue.catalogue);

/**
 * Select whether the credentials catalogue is stale, i.e. the JWT is expired.
 *
 * Normally, the catalogue is fetched every 24 hours according to the `expires` HTTP header.
 * If the fetch fails, it is still possible to select the persisted catalogue, but it may be stale.
 */
export const itwIsCredentialsCatalogueStale = (state: GlobalState) => {
  const catalogue = itwCredentialsCatalogueSelector(state);
  return catalogue ? isAfter(new Date(), new Date(catalogue.exp * 1000)) : true;
};
