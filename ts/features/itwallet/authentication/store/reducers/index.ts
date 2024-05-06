import * as pot from "@pagopa/ts-commons/lib/pot";
import { getType } from "typesafe-actions";
import { Action } from "../../../../../store/actions/types";
import { itwNfcIsEnabled } from "../actions";

export type ItwAuthenticationState = {
  nfcEnabled: pot.Pot<boolean, Error>;
};

const INITIAL_STATE: ItwAuthenticationState = {
  nfcEnabled: pot.none
};

const reducer = (
  state: ItwAuthenticationState = INITIAL_STATE,
  action: Action
): ItwAuthenticationState => {
  switch (action.type) {
    case getType(itwNfcIsEnabled.request):
      return {
        ...state,
        nfcEnabled: pot.toLoading(state.nfcEnabled)
      };
    case getType(itwNfcIsEnabled.success):
      return {
        ...state,
        nfcEnabled: pot.some(action.payload)
      };
    case getType(itwNfcIsEnabled.failure):
      return {
        ...state,
        nfcEnabled: pot.toError(state.nfcEnabled, action.payload)
      };
  }
  return state;
};

export default reducer;
