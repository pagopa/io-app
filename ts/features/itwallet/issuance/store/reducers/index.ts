import * as O from "fp-ts/lib/Option";
import { getType } from "typesafe-actions";
import { Action } from "../../../../../store/actions/types";
import { itwStoreIntegrityKeyTag, itwRemoveIntegrityKeyTag } from "../actions";

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
        integrityKeyTag: O.some(action.payload)
      };
    case getType(itwRemoveIntegrityKeyTag):
      return {
        integrityKeyTag: O.none
      };
  }
  return state;
};

export default reducer;
