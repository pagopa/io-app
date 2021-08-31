import * as pot from "italia-ts-commons/lib/pot";
import { getType } from "typesafe-actions";
import { Action } from "../../../../../store/actions/types";
import { svGenerateVoucherStart } from "../actions/voucherGeneration";
import { SvVoucher } from "../../types/SvVoucher";
import { svVoucherDetailGet } from "../actions/voucherList";
import { NetworkError } from "../../../../../utils/errors";

export type SelectedVoucherState = pot.Pot<SvVoucher, NetworkError>;
const INITIAL_STATE: SelectedVoucherState = pot.none;

const reducer = (
  state: SelectedVoucherState = INITIAL_STATE,
  action: Action
): SelectedVoucherState => {
  switch (action.type) {
    case getType(svGenerateVoucherStart):
      return INITIAL_STATE;
    case getType(svVoucherDetailGet.request):
      return pot.toLoading(state);
    case getType(svVoucherDetailGet.success):
      return pot.some(action.payload);
    case getType(svVoucherDetailGet.failure):
      return pot.toError(state, action.payload);
  }

  return state;
};

export default reducer;
