import * as O from "fp-ts/lib/Option";
import { getType } from "typesafe-actions";
import { Action } from "../../../../../store/actions/types";
import {
  itwStoreIntegrityKeyTag,
  itwRemoveIntegrityKeyTag,
  itwIpzsHasReadPolicy
} from "../actions";
import { itwLifecycleStoresReset } from "../../../lifecycle/store/actions";

export type ItwIssuanceState = {
  integrityKeyTag: O.Option<string>;
  hasReadIPZSPolicy: boolean;
};

export const itwIssuanceInitialState: ItwIssuanceState = {
  integrityKeyTag: O.none,
  hasReadIPZSPolicy: false
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
    case getType(itwLifecycleStoresReset):
      return {
        ...state,
        integrityKeyTag: O.none
      };
    case getType(itwIpzsHasReadPolicy):
      return {
        ...state,
        hasReadIPZSPolicy: action.payload
      };
  }
  return state;
};

export default reducer;
