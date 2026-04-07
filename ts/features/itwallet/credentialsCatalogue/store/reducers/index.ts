import * as pot from "@pagopa/ts-commons/lib/pot";
import { getType } from "typesafe-actions";

import { Action } from "../../../../../store/actions/types";
import { NetworkError } from "../../../../../utils/errors";
import { DigitalCredentialsCatalogue } from "../../../common/utils/itwCredentialsCatalogueUtils";
import { itwFetchCredentialsCatalogue } from "../actions";

export type ItwCredentialsCatalogueState = {
  catalogue: pot.Pot<DigitalCredentialsCatalogue, NetworkError>;
};

export const itwCredentialsCatalogueState: ItwCredentialsCatalogueState = {
  catalogue: pot.none
};

const reducer = (
  state = itwCredentialsCatalogueState,
  action: Action
): ItwCredentialsCatalogueState => {
  switch (action.type) {
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

    default:
      return state;
  }
};

export default reducer;
