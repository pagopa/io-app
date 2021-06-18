import { getType } from "typesafe-actions";
import { none, Option } from "fp-ts/lib/Option";
import { Action } from "../../../../../store/actions/types";
import { svGenerateVoucherStart } from "../actions/voucherGeneration";

export type VoucherGenerationState = {
  residenceInSicily: Option<boolean>;
  category: Option<number>;
};

export const INITIAL_STATE: VoucherGenerationState = {
  residenceInSicily: none,
  category: none
};

const reducer = (
  state: VoucherGenerationState = INITIAL_STATE,
  action: Action
): VoucherGenerationState => {
  switch (action.type) {
    case getType(svGenerateVoucherStart):
      return INITIAL_STATE;
  }

  return state;
};

export default reducer;
