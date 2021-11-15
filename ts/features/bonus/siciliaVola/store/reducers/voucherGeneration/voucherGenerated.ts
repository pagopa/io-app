import { getType } from "typesafe-actions";
import { createSelector } from "reselect";
import { SvVoucherGeneratedResponse } from "../../../types/SvVoucherResponse";
import { NetworkError } from "../../../../../../utils/errors";
import { Action } from "../../../../../../store/actions/types";
import {
  svGenerateVoucherGeneratedVoucher,
  svGenerateVoucherStart
} from "../../actions/voucherGeneration";
import {
  remoteError,
  remoteLoading,
  remoteReady,
  remoteUndefined,
  RemoteValue
} from "../../../../bpd/model/RemoteValue";
import { GlobalState } from "../../../../../../store/reducers/types";

export type VoucherGeneratedState = RemoteValue<
  SvVoucherGeneratedResponse,
  NetworkError
>;
const INITIAL_STATE: VoucherGeneratedState = remoteUndefined;

const reducer = (
  state: VoucherGeneratedState = INITIAL_STATE,
  action: Action
): VoucherGeneratedState => {
  switch (action.type) {
    case getType(svGenerateVoucherStart):
      return INITIAL_STATE;
    case getType(svGenerateVoucherGeneratedVoucher.request):
      return remoteLoading;
    case getType(svGenerateVoucherGeneratedVoucher.success):
      return remoteReady(action.payload);
    case getType(svGenerateVoucherGeneratedVoucher.failure):
      return remoteError(action.payload);
  }
  return state;
};

export const voucherGeneratedSelector = createSelector(
  [(state: GlobalState) => state.bonus.sv.voucherGeneration.voucherGenerated],
  (voucherGenerated: VoucherGeneratedState): VoucherGeneratedState =>
    voucherGenerated
);

export default reducer;
