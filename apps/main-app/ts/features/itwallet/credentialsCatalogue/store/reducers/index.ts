import * as pot from "@pagopa/ts-commons/lib/pot";
import { getType } from "typesafe-actions";

import { Action } from "../../../../../store/actions/types";
import { NetworkError } from "../../../../../utils/errors";
import {
  CatalogueTranslations,
  DigitalCredentialsCatalogue
} from "../../../common/utils/itwCredentialsCatalogueUtils";
import {
  itwFetchCatalogueTranslations,
  itwFetchCredentialsCatalogue,
  itwSetCatalogueEnabledForCredentialsList
} from "../actions";

export type ItwCredentialsCatalogueState = {
  catalogue: pot.Pot<DigitalCredentialsCatalogue, NetworkError>;
  /**
   * Use the credentials catalogue as the source of truth for displaying the
   * list of obtainable credentials, ignoring any hardcoded value.
   */
  isEnabledForCredentialsList: boolean;
  /**
   * Locale bundles fetched from the catalogue's localization endpoints. Only
   * populated for IT-Wallet spec v1.3.3. Keyed by locale code (e.g. "it"), then
   * by l10n_id.
   */
  translations: pot.Pot<CatalogueTranslations, NetworkError>;
};

export const itwCredentialsCatalogueState: ItwCredentialsCatalogueState = {
  isEnabledForCredentialsList: false,
  catalogue: pot.none,
  translations: pot.none
};

const reducer = (
  state = itwCredentialsCatalogueState,
  action: Action
): ItwCredentialsCatalogueState => {
  switch (action.type) {
    case getType(itwFetchCatalogueTranslations.failure):
      return {
        ...state,
        translations: pot.toError(state.translations, action.payload)
      };
    case getType(itwFetchCatalogueTranslations.request):
      return {
        ...state,
        translations: pot.toLoading(state.translations)
      };
    case getType(itwFetchCatalogueTranslations.success):
      return {
        ...state,
        translations: pot.some(action.payload)
      };
    case getType(itwFetchCredentialsCatalogue.failure):
      return {
        ...state,
        catalogue: pot.toError(state.catalogue, action.payload)
      };
    case getType(itwFetchCredentialsCatalogue.request):
      return {
        ...state,
        catalogue: pot.toLoading(state.catalogue)
      };
    case getType(itwFetchCredentialsCatalogue.success):
      return {
        ...state,
        catalogue: pot.some(action.payload)
      };
    case getType(itwSetCatalogueEnabledForCredentialsList):
      return {
        ...state,
        isEnabledForCredentialsList: action.payload
      };

    default:
      return state;
  }
};

export default reducer;
