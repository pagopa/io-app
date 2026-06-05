import {
  ActionType,
  createAsyncAction,
  createStandardAction
} from "typesafe-actions";
import { NetworkError } from "../../../../../utils/errors";
import {
  CatalogueTranslations,
  DigitalCredentialsCatalogue
} from "../../../common/utils/itwCredentialsCatalogueUtils";

/** This action handles the Digital Credentials Catalogue fetch */
export const itwFetchCredentialsCatalogue = createAsyncAction(
  "ITW_CREDENTIALS_CATALOGUE_REQUEST",
  "ITW_CREDENTIALS_CATALOGUE_SUCCESS",
  "ITW_CREDENTIALS_CATALOGUE_FAILURE"
)<void, DigitalCredentialsCatalogue, NetworkError>();

/**
 * This action handles the fetch of catalogue locale translations. Only
 * dispatched for IT-Wallet spec v1.3.3.
 */
export const itwFetchCatalogueTranslations = createAsyncAction(
  "ITW_CATALOGUE_TRANSLATIONS_REQUEST",
  "ITW_CATALOGUE_TRANSLATIONS_SUCCESS",
  "ITW_CATALOGUE_TRANSLATIONS_FAILURE"
)<void, CatalogueTranslations, NetworkError>();

export const itwSetCatalogueEnabledForCredentialsList = createStandardAction(
  "ITW_SET_CATALOGUE_ENABLED_FOR_CREDENTIALS_LIST"
)<boolean>();

export type ItwCredentialsCatalogueActions =
  | ActionType<typeof itwFetchCredentialsCatalogue>
  | ActionType<typeof itwFetchCatalogueTranslations>
  | ActionType<typeof itwSetCatalogueEnabledForCredentialsList>;
