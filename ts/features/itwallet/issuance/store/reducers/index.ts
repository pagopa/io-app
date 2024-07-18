import * as O from "fp-ts/lib/Option";
import { getType } from "typesafe-actions";
import { Action } from "../../../../../store/actions/types";
import { itwResetPid, itwStoreIntegrityKeyTag, itwStorePid } from "../actions";
import { StoredCredential } from "../../../common/utils/itwTypesUtils";

export type ItwIssuanceState = {
  integrityKeyTag: O.Option<string>;
  pid: O.Option<StoredCredential>;
};

const INITIAL_STATE: ItwIssuanceState = {
  integrityKeyTag: O.none,
  pid: O.none
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
    case getType(itwStorePid):
      return {
        ...state,
        pid: O.some(action.payload)
      };
    case getType(itwResetPid):
      return { ...INITIAL_STATE };
  }
  return state;
};

export default reducer;
