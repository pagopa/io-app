import { getType } from "typesafe-actions";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { Action } from "../../../../../store/actions/types";
import { NetworkError } from "../../../../../utils/errors";
import {
  itwFetchCredentialsCatalogue,
  itwSetCatalogueEnabledForCredentialsList
} from "../actions";
import { DigitalCredentialsCatalogue } from "../../../common/utils/itwCredentialsCatalogueUtils";

export type ItwCredentialsCatalogueState = {
  /**
   * Use the credentials catalogue as the source of truth for displaying the
   * list of obtainable credentials, ignoring any hardcoded value.
   */
  isEnabledForCredentialsList: boolean;
  catalogue: pot.Pot<DigitalCredentialsCatalogue, NetworkError>;
};

export const itwCredentialsCatalogueState: ItwCredentialsCatalogueState = {
  isEnabledForCredentialsList: false,
  catalogue: pot.none
};

const reducer = (
  state = itwCredentialsCatalogueState,
  action: Action
): ItwCredentialsCatalogueState => {
  switch (action.type) {
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
    case getType(itwFetchCredentialsCatalogue.failure):
      return {
        ...state,
        catalogue: pot.toError(state.catalogue, action.payload)
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
