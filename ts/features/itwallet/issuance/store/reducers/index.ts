import * as O from "fp-ts/lib/Option";
import { getType } from "typesafe-actions";
import { Action } from "../../../../../store/actions/types";
import { itwRemoveHardwareKeyTag, itwStoreHardwareKeyTag } from "../actions";

export type ItwIssuanceState = {
  hardwareKeyTag: O.Option<string>;
};

const INITIAL_STATE: ItwIssuanceState = {
  hardwareKeyTag: O.none
};

const reducer = (
  state: ItwIssuanceState = INITIAL_STATE,
  action: Action
): ItwIssuanceState => {
  switch (action.type) {
    case getType(itwStoreHardwareKeyTag):
      return {
        ...state,
        hardwareKeyTag: O.some(action.payload)
      };
    case getType(itwRemoveHardwareKeyTag):
      return {
        ...state,
        hardwareKeyTag: O.none
      };
  }
  return state;
};

export default reducer;
