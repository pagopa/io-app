import * as O from "fp-ts/lib/Option";
import { getType } from "typesafe-actions";
import { Action } from "../../../../../store/actions/types";
import {
  itwIntegritySetServiceIsReady,
  itwRemoveIntegrityKeyTag,
  itwStoreIntegrityKeyTag
} from "../actions";
import { itwLifecycleStoresReset } from "../../../lifecycle/store/actions";

export type ItwIssuanceState = {
  integrityKeyTag: O.Option<string>;
  integrityServiceReady?: boolean;
};

export const itwIssuanceInitialState: ItwIssuanceState = {
  integrityKeyTag: O.none
};

const reducer = (
  state: ItwIssuanceState = itwIssuanceInitialState,
  action: Action
): ItwIssuanceState => {
  switch (action.type) {
    case getType(itwStoreIntegrityKeyTag):
      return {
        ...state,
        integrityKeyTag: O.some(action.payload)
      };
    case getType(itwRemoveIntegrityKeyTag):
      return {
        ...state,
        integrityKeyTag: O.none
      };
    case getType(itwIntegritySetServiceIsReady):
      return {
        ...state,
        integrityServiceReady: action.payload
      };
    case getType(itwLifecycleStoresReset):
      return {
        integrityKeyTag: O.none,
        integrityServiceReady: undefined
      };
  }
  return state;
};

export default reducer;
