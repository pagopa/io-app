import * as O from "fp-ts/lib/Option";
import { getType } from "typesafe-actions";
import { Action } from "../../../../../store/actions/types";
import { itwStoreIntegrityKeyTag, itwRemoveIntegrityKeyTag } from "../actions";
import { itwLifecycleReducersReset } from "../../../lifecycle/store/actions";

export type ItwIssuanceState = {
  integrityKeyTag: O.Option<string>;
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
        integrityKeyTag: O.some(action.payload)
      };
    case getType(itwRemoveIntegrityKeyTag):
    case getType(itwLifecycleReducersReset):
      return {
        integrityKeyTag: O.none
      };
  }
  return state;
};

export default reducer;
