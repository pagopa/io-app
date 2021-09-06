import { getType } from "typesafe-actions";
import { Action } from "../../../../../../store/actions/types";
import { svVoucherListGet } from "../../actions/voucherList";
import {
  remoteError,
  remoteLoading,
  remoteReady,
  remoteUndefined,
  RemoteValue
} from "../../../../bpd/model/RemoteValue";
import { NetworkError } from "../../../../../../utils/errors";
import { svGenerateVoucherStart } from "../../actions/voucherGeneration";
import {
  IndexedById,
  toIndexed
} from "../../../../../../store/helpers/indexer";
import { VoucherPreview } from "../../../types/SvVoucherResponse";

export type VouchersState = RemoteValue<
  IndexedById<VoucherPreview>,
  NetworkError
>;

const INITIAL_STATE: VouchersState = remoteUndefined;

const reducer = (
  state: VouchersState = INITIAL_STATE,
  action: Action
): VouchersState => {
  switch (action.type) {
    case getType(svGenerateVoucherStart):
      return INITIAL_STATE;
    case getType(svVoucherListGet.request):
      return remoteLoading;
    case getType(svVoucherListGet.success):
      return remoteReady(toIndexed(action.payload, v => v.idVoucher));
    case getType(svVoucherListGet.failure):
      return remoteError(action.payload);
  }

  return state;
};

export default reducer;
