import { Action, combineReducers } from "redux";
import svVoucherGenerationReducer, {
  VoucherGenerationState
} from "./voucherGeneration";

export type SvState = {
  voucherGeneration: VoucherGenerationState;
};

const svReducer = combineReducers<SvState, Action>({
  voucherGeneration: svVoucherGenerationReducer
});

export default svReducer;
