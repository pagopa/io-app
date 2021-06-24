import * as pot from "italia-ts-commons/lib/pot";
import { getType } from "typesafe-actions";
import { IndexedById, toIndexed } from "../../../../../store/helpers/indexer";
import { State } from "../../types/SvVoucherRequest";
import { NetworkError } from "../../../../../utils/errors";
import { Action } from "../../../../../store/actions/types";
import {
  svGenerateVoucherAvailableState,
  svGenerateVoucherStart
} from "../actions/voucherGeneration";

export type AvailableStateState = pot.Pot<IndexedById<State>, NetworkError>;
const INITIAL_STATE: AvailableStateState = pot.none;

const reducer = (
  state: AvailableStateState = INITIAL_STATE,
  action: Action
): AvailableStateState => {
  switch (action.type) {
    case getType(svGenerateVoucherStart):
      return INITIAL_STATE;
    case getType(svGenerateVoucherAvailableState.request):
      return pot.toLoading(state);
    case getType(svGenerateVoucherAvailableState.success):
      return pot.some(toIndexed(action.payload, s => s.id));
    case getType(svGenerateVoucherAvailableState.failure):
      return pot.toError(state, action.payload);
  }
  return state;
};

export default reducer;
