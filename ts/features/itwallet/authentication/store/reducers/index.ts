import * as pot from "@pagopa/ts-commons/lib/pot";
import { getType } from "typesafe-actions";
import { Action } from "../../../../../store/actions/types";
import { itwNfcIsEnabled } from "../actions";

export type ItwAuthenticationState = {
  isNfcEnabled: pot.Pot<boolean, Error>;
};

const INITIAL_STATE: ItwAuthenticationState = {
  isNfcEnabled: pot.none
};

const reducer = (
  state: ItwAuthenticationState = INITIAL_STATE,
  action: Action
): ItwAuthenticationState => {
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
