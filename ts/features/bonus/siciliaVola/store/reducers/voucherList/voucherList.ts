import { Action } from "../../../../../../store/actions/types";

import svPossibleVoucherStateReducer, {
  PossibleVoucherStateState
} from "./possibleVoucherState";
import { combineReducers } from "redux";
import svVouchersStateReducer, { VouchersState } from "./vouchers";

export type VoucherListState = {
  possibleVoucherState: PossibleVoucherStateState;
  vouchers: VouchersState;
};

const svVoucherListReducer = combineReducers<VoucherListState, Action>({
  possibleVoucherState: svPossibleVoucherStateReducer,
  vouchers: svVouchersStateReducer
});

export default svVoucherListReducer;
