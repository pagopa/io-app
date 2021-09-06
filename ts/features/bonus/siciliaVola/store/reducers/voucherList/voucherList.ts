import { Action } from "../../../../../../store/actions/types";

import svPossibleVoucherStateReducer, {
  PossibleVoucherStateState
} from "./possibleVoucherState";
import { combineReducers } from "redux";
import svVouchersStateReducer, { VouchersState } from "./vouchers";
import svFilterStateReducer, { FilterState } from "./filters";

export type VoucherListState = {
  possibleVoucherState: PossibleVoucherStateState;
  vouchers: VouchersState;
  filters: FilterState;
};

const svVoucherListReducer = combineReducers<VoucherListState, Action>({
  possibleVoucherState: svPossibleVoucherStateReducer,
  vouchers: svVouchersStateReducer,
  filters: svFilterStateReducer
});

export default svVoucherListReducer;
