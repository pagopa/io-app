import { combineReducers } from "redux";
import { Action } from "../../../../../../store/actions/types";
import svPossibleVoucherStateReducer, {
  PossibleVoucherStateState
} from "./possibleVoucherState";
import svVouchersStateReducer, { VouchersState } from "./vouchers";
import svFilterStateReducer, { FilterState } from "./filters";
import svVouchersListUiReducer, { VouchersListUiState } from "./ui";

export type VoucherListState = {
  possibleVoucherState: PossibleVoucherStateState;
  vouchers: VouchersState;
  filters: FilterState;
  ui: VouchersListUiState;
};

const svVoucherListReducer = combineReducers<VoucherListState, Action>({
  possibleVoucherState: svPossibleVoucherStateReducer,
  vouchers: svVouchersStateReducer,
  filters: svFilterStateReducer,
  ui: svVouchersListUiReducer
});

export default svVoucherListReducer;
