import { ActionType, createAsyncAction } from "typesafe-actions";
import { NetworkError } from "../../../../../utils/errors";
import { DigitalCredentialsCatalogue } from "../../../common/utils/itwCredentialsCatalogueUtils";

/**
 * This action handles the Digital Credentials Catalogue fetch
 */
export const itwFetchCredentialsCatalogue = createAsyncAction(
  "ITW_CREDENTIALS_CATALOGUE_REQUEST",
  "ITW_CREDENTIALS_CATALOGUE_SUCCESS",
  "ITW_CREDENTIALS_CATALOGUE_FAILURE"
)<void, DigitalCredentialsCatalogue, NetworkError>();

export type ItwCredentialsCatalogueActions = ActionType<
  typeof itwFetchCredentialsCatalogue
>;
