import { getType } from "typesafe-actions";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { Action } from "../../../../../store/actions/types";
import { NetworkError } from "../../../../../utils/errors";
import { itwFetchCredentialsCatalogue } from "../actions";
import { DigitalCredentialsCatalogue } from "../../../common/utils/itwCredentialsCatalogueUtils";

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

    default:
      return state;
  }
};

export default reducer;
