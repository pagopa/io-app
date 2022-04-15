import { getType } from "typesafe-actions";
import { createSelector } from "reselect";
import { Action } from "../../../../../store/actions/types";
import {
  svGenerateVoucherStart,
  svGetPdfVoucher
} from "../actions/voucherGeneration";
import { SvVoucher, SvVoucherId } from "../../types/SvVoucher";
import {
  svSelectVoucher,
  svVoucherDetailGet,
  svVoucherRevocation
} from "../actions/voucherList";
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
  revocation: RemoteValue<true, NetworkError>;
  voucherPdf: RemoteValue<string, NetworkError>;
};
const INITIAL_STATE: SelectedVoucherState = {
  voucher: remoteUndefined,
  revocation: remoteUndefined,
  voucherPdf: remoteUndefined
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
      return {
        ...state,
        voucherCode: action.payload,
        revocation: remoteUndefined,
        voucherPdf: remoteUndefined
      };
    case getType(svVoucherRevocation.request):
      return { ...state, revocation: remoteLoading };
    case getType(svVoucherRevocation.success):
      return { ...state, revocation: remoteReady(true) };
    case getType(svVoucherRevocation.failure):
      return { ...state, revocation: remoteError(action.payload) };
    case getType(svGetPdfVoucher.request):
      return { ...state, voucherPdf: remoteLoading };
    case getType(svGetPdfVoucher.success):
      return { ...state, voucherPdf: remoteReady(action.payload) };
    case getType(svGetPdfVoucher.failure):
      return { ...state, voucherPdf: remoteError(action.payload) };
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
export const selectedVoucherRevocationStateSelector = createSelector(
  [(state: GlobalState) => state.bonus.sv.selectedVoucher.revocation],
  (
    revocationState: RemoteValue<true, NetworkError>
  ): RemoteValue<true, NetworkError> => revocationState
);

export const selectedPdfVoucherStateSelector = createSelector(
  [(state: GlobalState) => state.bonus.sv.selectedVoucher.voucherPdf],
  (
    voucherPdfState: RemoteValue<string, NetworkError>
  ): RemoteValue<string, NetworkError> => voucherPdfState
);

export default reducer;
