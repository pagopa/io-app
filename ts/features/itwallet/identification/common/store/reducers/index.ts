import * as pot from "@pagopa/ts-commons/lib/pot";
import { getType } from "typesafe-actions";
import { Action } from "../../../../../../store/actions/types";
import { itwHasNfcFeature } from "../actions";

export type ItwIdentificationState = {
  hasNfcFeature: pot.Pot<boolean, Error>;
};

export const itwIdentificationInitialState: ItwIdentificationState = {
  hasNfcFeature: pot.none
};

const reducer = (
  state: ItwIdentificationState = itwIdentificationInitialState,
  action: Action
): ItwIdentificationState => {
  switch (action.type) {
    case getType(itwHasNfcFeature.request):
      return {
        ...state,
        hasNfcFeature: pot.toLoading(state.hasNfcFeature)
      };
    case getType(itwHasNfcFeature.success):
      return {
        ...state,
        hasNfcFeature: pot.some(action.payload)
      };
    case getType(itwHasNfcFeature.failure):
      return {
        ...state,
        hasNfcFeature: pot.toError(state.hasNfcFeature, action.payload)
      };
  }
  return state;
};

export default reducer;
