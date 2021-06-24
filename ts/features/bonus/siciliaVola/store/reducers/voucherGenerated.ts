import { getType } from "typesafe-actions";
import * as pot from "italia-ts-commons/lib/pot";
import { SvVoucherGeneratedResponse } from "../../types/svVoucherResponse";
import { NetworkError } from "../../../../../utils/errors";
import { Action } from "../../../../../store/actions/types";
import {
  svGenerateVoucherGeneratedVoucher,
  svGenerateVoucherStart
} from "../actions/voucherGeneration";

export type VoucherGeneratedState = pot.Pot<
  SvVoucherGeneratedResponse,
  NetworkError
>;
const INITIAL_STATE: VoucherGeneratedState = pot.none;

const reducer = (
  state: VoucherGeneratedState = INITIAL_STATE,
  action: Action
): VoucherGeneratedState => {
  switch (action.type) {
    case getType(svGenerateVoucherStart):
      return INITIAL_STATE;
    case getType(svGenerateVoucherGeneratedVoucher.request):
      return pot.toLoading(state);

    case getType(svGenerateVoucherGeneratedVoucher.success):
      return pot.some(action.payload);

    case getType(svGenerateVoucherGeneratedVoucher.failure):
      return pot.toError(state, action.payload);
  }
  return state;
};

export default reducer;
