import * as pot from "@pagopa/ts-commons/lib/pot";
import { getType } from "typesafe-actions";
import { Action } from "../../../../../store/actions/types";
import { itwCieIsSupported, itwNfcIsEnabled } from "../actions";

// TODO: [SIW-1404] remove this reducer and move the logic to xstate
export type ItwIdentificationState = {
  isNfcEnabled: pot.Pot<boolean, Error>;
  isCieSupported: pot.Pot<boolean, Error>;
};

export const itwIdentificationInitialState: ItwIdentificationState = {
  isNfcEnabled: pot.none,
  isCieSupported: pot.none
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
    case getType(itwCieIsSupported.request):
      return {
        ...state,
        isCieSupported: pot.toLoading(state.isCieSupported)
      };
    case getType(itwCieIsSupported.success):
      return {
        ...state,
        isCieSupported: pot.some(action.payload)
      };
    case getType(itwCieIsSupported.failure):
      return {
        ...state,
        isCieSupported: pot.toError(state.isCieSupported, action.payload)
      };
  }
  return state;
};

export default reducer;
