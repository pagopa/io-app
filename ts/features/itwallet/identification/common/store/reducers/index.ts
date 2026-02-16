import * as pot from "@pagopa/ts-commons/lib/pot";
import { getType } from "typesafe-actions";
import { Action } from "../../../../../../store/actions/types";
import { itwHasNfcFeature, itwRestrictedMode } from "../actions";

export type ItwIdentificationState = {
  hasNfcFeature: pot.Pot<boolean, Error>;
  restrictedMode: boolean;
};

export const itwIdentificationInitialState: ItwIdentificationState = {
  hasNfcFeature: pot.none,
  restrictedMode: false
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
    case getType(itwRestrictedMode):
      return {
        ...state,
        restrictedMode: action.payload
      };
  }
  return state;
};

export default reducer;

// TODO: method to persist

// const CURRENT_REDUX_ITW_IDENTIFICATION_STORE_VERSION = -1;

// const itwIdentificationPersistConfig: PersistConfig = {
//   key: "itWalletIdentification",
//   storage: createSecureStorage(),
//   whitelist: ["restrictedMode"],
//   version: CURRENT_REDUX_ITW_IDENTIFICATION_STORE_VERSION
// };

// export default persistReducer(itwIdentificationPersistConfig, reducer);
