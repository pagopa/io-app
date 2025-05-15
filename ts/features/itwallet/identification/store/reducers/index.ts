import * as pot from "@pagopa/ts-commons/lib/pot";
import { getType } from "typesafe-actions";
import { Action } from "../../../../../store/actions/types";
import { itwNfcIsEnabled } from "../actions";

export type ItwIdentificationState = {
  isNfcEnabled: pot.Pot<boolean, Error>;
};

export const itwIdentificationInitialState: ItwIdentificationState = {
  isNfcEnabled: pot.none
};

const reducer = (
  state: ItwIdentificationState = itwIdentificationInitialState,
  action: Action
): ItwIdentificationState => {
  switch (action.type) {
    case getType(itwNfcIsEnabled.request):
      return {
        ...state,
        isNfcEnabled: pot.toLoading(state.isNfcEnabled)
      };
    case getType(itwNfcIsEnabled.success):
      return {
        ...state,
        isNfcEnabled: pot.some(action.payload)
      };
    case getType(itwNfcIsEnabled.failure):
      return {
        ...state,
        isNfcEnabled: pot.toError(state.isNfcEnabled, action.payload)
      };
  }
  return state;
};

export default reducer;
