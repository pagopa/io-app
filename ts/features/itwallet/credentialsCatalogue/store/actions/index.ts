import {
  ActionType,
  createAsyncAction,
  createStandardAction
} from "typesafe-actions";
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

export const itwSetCatalogueEnabledForCredentialsList = createStandardAction(
  "ITW_SET_CATALOGUE_ENABLED_FOR_CREDENTIALS_LIST"
)<boolean>();

export type ItwCredentialsCatalogueActions =
  | ActionType<typeof itwFetchCredentialsCatalogue>
  | ActionType<typeof itwSetCatalogueEnabledForCredentialsList>;
