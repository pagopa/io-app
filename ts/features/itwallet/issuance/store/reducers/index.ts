import * as O from "fp-ts/lib/Option";
import { getType } from "typesafe-actions";
import { Action } from "../../../../../store/actions/types";
import { itwRemoveIntegrityKeyTag, itwStoreIntegrityKeyTag } from "../actions";

export type ItwIssuanceState = {
  integrityKeyTag: O.Option<string>;
};

const INITIAL_STATE: ItwIssuanceState = {
  integrityKeyTag: O.none
};

const reducer = (
  state: ItwIssuanceState = INITIAL_STATE,
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
  }
  return state;
};

export default reducer;
