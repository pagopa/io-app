import { Action, combineReducers } from "redux";
import svVoucherGenerationReducer, {
  VoucherGenerationState
} from "./voucherGeneration/voucherGeneration";
import svVoucherListReducer, {
  VoucherListState
} from "./voucherList/voucherList";
import svActivationReducer, { ActivationState } from "./activation";
import selectedVoucherReducer, {
  SelectedVoucherState
} from "./selectedVoucher";

export type SvState = {
  activation: ActivationState;
  voucherGeneration: VoucherGenerationState;
  voucherList: VoucherListState;
  selectedVoucher: SelectedVoucherState;
};

const svReducer = combineReducers<SvState, Action>({
  activation: svActivationReducer,
  voucherGeneration: svVoucherGenerationReducer,
  voucherList: svVoucherListReducer,
  selectedVoucher: selectedVoucherReducer
});

export default svReducer;
