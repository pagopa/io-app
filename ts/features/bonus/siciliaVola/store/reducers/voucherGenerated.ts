import * as pot from "italia-ts-commons/lib/pot";
import { SvVoucherGeneratedResponse } from "../../types/svVoucherResponse";
import { NetworkError } from "../../../../../utils/errors";
import { Action } from "../../../../../store/actions/types";
import { getType } from "typesafe-actions";
import { svGenerateVoucherGeneratedVoucher } from "../actions/voucherGeneration";

const INITIAL_STATE: pot.Pot<SvVoucherGeneratedResponse, NetworkError> =
  pot.none;

const reducer = (
  state: pot.Pot<SvVoucherGeneratedResponse, NetworkError> = INITIAL_STATE,
  action: Action
): pot.Pot<SvVoucherGeneratedResponse, NetworkError> => {
  switch (action.type) {
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
