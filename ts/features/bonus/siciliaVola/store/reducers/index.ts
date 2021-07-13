import { Action, combineReducers } from "redux";
import svVoucherGenerationReducer, {
  VoucherGenerationState
} from "./voucherGeneration";
import svVoucherListReducer, { VoucherListState } from "./voucherList";

export type SvState = {
  voucherGeneration: VoucherGenerationState;
  voucherList: VoucherListState;
};

const svReducer = combineReducers<SvState, Action>({
  voucherGeneration: svVoucherGenerationReducer,
  voucherList: svVoucherListReducer
});

export default svReducer;
