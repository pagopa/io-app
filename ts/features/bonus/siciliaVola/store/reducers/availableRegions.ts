import * as pot from "italia-ts-commons/lib/pot";
import { getType } from "typesafe-actions";
import { IndexedById, toIndexed } from "../../../../../store/helpers/indexer";
import { Region } from "../../types/SvVoucherRequest";
import { NetworkError } from "../../../../../utils/errors";
import { Action } from "../../../../../store/actions/types";
import {
  svGenerateVoucherAvailableRegion,
  svGenerateVoucherAvailableState,
  svGenerateVoucherStart
} from "../actions/voucherGeneration";

export type AvailableRegionsState = pot.Pot<IndexedById<Region>, NetworkError>;
const INITIAL_STATE: AvailableRegionsState = pot.none;

const reducer = (
  state: AvailableRegionsState = INITIAL_STATE,
  action: Action
): AvailableRegionsState => {
  switch (action.type) {
    case getType(svGenerateVoucherStart):
      return INITIAL_STATE;
    case getType(svGenerateVoucherAvailableState.request):
      return pot.none;
    case getType(svGenerateVoucherAvailableRegion.request):
      return pot.toLoading(state);
    case getType(svGenerateVoucherAvailableRegion.success):
      return pot.some(toIndexed(action.payload, r => r.id));
    case getType(svGenerateVoucherAvailableRegion.failure):
      return pot.toError(state, action.payload);
  }
  return state;
};

export default reducer;
