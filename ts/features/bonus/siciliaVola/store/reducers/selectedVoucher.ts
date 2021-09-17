import { getType } from "typesafe-actions";
import { Action } from "../../../../../store/actions/types";
import { svGenerateVoucherStart } from "../actions/voucherGeneration";
import { SvVoucher } from "../../types/SvVoucher";
import { svVoucherDetailGet } from "../actions/voucherList";
import { NetworkError } from "../../../../../utils/errors";
import {
  remoteError,
  remoteLoading,
  remoteReady,
  remoteUndefined,
  RemoteValue
} from "../../../bpd/model/RemoteValue";

export type SelectedVoucherState = {
  voucherCode?: string;
  voucher: RemoteValue<SvVoucher, NetworkError>;
};
const INITIAL_STATE: SelectedVoucherState = {
  voucher: remoteUndefined
};

const reducer = (
  state: SelectedVoucherState = INITIAL_STATE,
  action: Action
): SelectedVoucherState => {
  switch (action.type) {
    case getType(svGenerateVoucherStart):
      return INITIAL_STATE;
    case getType(svVoucherDetailGet.request):
      return { ...state, voucher: remoteLoading };
    case getType(svVoucherDetailGet.success):
      return { ...state, voucher: remoteReady(action.payload) };
    case getType(svVoucherDetailGet.failure):
      return { ...state, voucher: remoteError(action.payload) };
  }

  return state;
};

export default reducer;
