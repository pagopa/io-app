import { getType } from "typesafe-actions";
import { createSelector } from "reselect";
import { Action } from "../../../../../../store/actions/types";
import { svSetFilter, svVoucherListGet } from "../../actions/voucherList";
import { svGenerateVoucherCompleted } from "../../actions/voucherGeneration";
import {
  IndexedById,
  toIndexed
} from "../../../../../../store/helpers/indexer";
import {
  SvVoucherListResponse,
  VoucherPreview
} from "../../../types/SvVoucherResponse";
import { GlobalState } from "../../../../../../store/reducers/types";

export type VouchersState = IndexedById<VoucherPreview>;

const INITIAL_STATE: VouchersState = {};

const updateVouchers = (
  currentVouchers: VouchersState,
  newVouchers: SvVoucherListResponse
): IndexedById<VoucherPreview> => {
  const newVouchersIndexed = toIndexed(newVouchers, v => v.idVoucher);
  return { ...currentVouchers, ...newVouchersIndexed };
};

const reducer = (
  state: VouchersState = INITIAL_STATE,
  action: Action
): VouchersState => {
  switch (action.type) {
    case getType(svGenerateVoucherCompleted):
    case getType(svSetFilter):
      return INITIAL_STATE;
    case getType(svVoucherListGet.request):
    case getType(svVoucherListGet.failure):
      return state;
    case getType(svVoucherListGet.success):
      return updateVouchers(state, action.payload);
  }

  return state;
};

export const svVouchersSelector = createSelector(
  [(state: GlobalState) => state.bonus.sv.voucherList.vouchers],
  (vouchers: VouchersState): VouchersState => vouchers
);

export default reducer;
