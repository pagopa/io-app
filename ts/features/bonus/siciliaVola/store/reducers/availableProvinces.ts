import * as pot from "italia-ts-commons/lib/pot";
import { getType } from "typesafe-actions";
import { IndexedById, toIndexed } from "../../../../../store/helpers/indexer";
import { Province } from "../../types/SvVoucherRequest";
import { NetworkError } from "../../../../../utils/errors";
import { Action } from "../../../../../store/actions/types";
import {
  svGenerateVoucherAvailableProvince,
  svGenerateVoucherAvailableRegion,
  svGenerateVoucherAvailableState,
  svGenerateVoucherStart
} from "../actions/voucherGeneration";

export type AvailableProvincesState = pot.Pot<
  IndexedById<Province>,
  NetworkError
>;
const INITIAL_STATE: AvailableProvincesState = pot.none;

const reducer = (
  state: AvailableProvincesState = INITIAL_STATE,
  action: Action
): AvailableProvincesState => {
  switch (action.type) {
    case getType(svGenerateVoucherStart):
      return INITIAL_STATE;
    case getType(svGenerateVoucherAvailableState.request):
      return pot.none;
    case getType(svGenerateVoucherAvailableRegion.request):
      return pot.none;
    case getType(svGenerateVoucherAvailableProvince.request):
      return pot.toLoading(state);
    case getType(svGenerateVoucherAvailableProvince.success):
      return pot.some(toIndexed(action.payload, p => p.id));
    case getType(svGenerateVoucherAvailableProvince.failure):
      return pot.toError(state, action.payload);
  }
  return state;
};

export default reducer;
