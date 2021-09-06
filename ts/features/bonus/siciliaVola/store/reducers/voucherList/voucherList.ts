import { getType } from "typesafe-actions";
import { Action } from "../../../../../../store/actions/types";
import { svGenerateVoucherStart } from "../../actions/voucherGeneration";
import {
  IndexedById,
  toIndexed
} from "../../../../../../store/helpers/indexer";
import { svVoucherListGet } from "../../actions/voucherList";
import { NetworkError } from "../../../../../../utils/errors";
import { VoucherPreview } from "../../../types/SvVoucherResponse";
import {
  remoteError,
  remoteLoading,
  remoteReady,
  remoteUndefined,
  RemoteValue
} from "../../../../bpd/model/RemoteValue";
import svPossibleVoucherStateReducer, {
  possibleVoucherStateState
} from "./possibleVoucherState";
import { combineReducers } from "redux";

export type VoucherListState = {
  possibleVoucherState: possibleVoucherStateState;
  vouchers: RemoteValue<IndexedById<VoucherPreview>, NetworkError>;
};
const INITIAL_STATE: VoucherListState = {
  possibleVoucherState: remoteUndefined,
  vouchers: remoteUndefined
};

const vouchersReducer = (
  state: VoucherListState = INITIAL_STATE,
  action: Action
): VoucherListState => {
  switch (action.type) {
    case getType(svGenerateVoucherStart):
      return INITIAL_STATE;
    case getType(svVoucherListGet.request):
      return { ...state, vouchers: remoteLoading };
    case getType(svVoucherListGet.success):
      return {
        ...state,
        vouchers: remoteReady(toIndexed(action.payload, v => v.idVoucher))
      };
    case getType(svVoucherListGet.failure):
      return { ...state, vouchers: remoteError(action.payload) };
  }

  return state;
};

const svVoucherListReducer = combineReducers<VoucherListState, Action>({
  possibleVoucherState: svPossibleVoucherStateReducer,
  vouchers: vouchersReducer
});

export default svVoucherListReducer;
