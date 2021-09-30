import { getType } from "typesafe-actions";
import { createSelector } from "reselect";
import { Action } from "../../../../../store/actions/types";
import { svGenerateVoucherStart } from "../actions/voucherGeneration";
import { SvVoucher, SvVoucherId } from "../../types/SvVoucher";
import { svSelectVoucher, svVoucherDetailGet } from "../actions/voucherList";
import { NetworkError } from "../../../../../utils/errors";
import {
  remoteError,
  remoteLoading,
  remoteReady,
  remoteUndefined,
  RemoteValue
} from "../../../bpd/model/RemoteValue";
import { GlobalState } from "../../../../../store/reducers/types";

export type SelectedVoucherState = {
  voucherCode?: SvVoucherId;
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
    case getType(svSelectVoucher):
      return { ...state, voucherCode: action.payload };
  }

  return state;
};

export const selectedVoucherCodeSelector = createSelector(
  [(state: GlobalState) => state.bonus.sv.selectedVoucher.voucherCode],
  (voucherCode?: SvVoucherId): SvVoucherId | undefined => voucherCode
);
export const selectedVoucherSelector = createSelector(
  [(state: GlobalState) => state.bonus.sv.selectedVoucher.voucher],
  (
    voucher: RemoteValue<SvVoucher, NetworkError>
  ): RemoteValue<SvVoucher, NetworkError> => voucher
);

export default reducer;
