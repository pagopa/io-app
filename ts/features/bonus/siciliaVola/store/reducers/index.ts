import svVoucherGenerationReducer, {
  VoucherGenerationState
} from "./voucherGeneration";
import { Action, combineReducers } from "redux";

export type SvState = {
  voucherGeneration: VoucherGenerationState;
};

const svReducer = combineReducers<SvState, Action>({
  voucherGeneration: svVoucherGenerationReducer
});

export default svReducer;
