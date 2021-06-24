import * as pot from "italia-ts-commons/lib/pot";
import { getType } from "typesafe-actions";
import { Action } from "../../../../../store/actions/types";
import { svGenerateVoucherStart } from "../actions/voucherGeneration";
import { SvVoucher } from "../../types/svVoucher";
import { IndexedById, toIndexed } from "../../../../../store/helpers/indexer";
import { svVoucherListGet } from "../actions/voucherList";
import { NetworkError } from "../../../../../utils/errors";

export type VoucherListState = pot.Pot<IndexedById<SvVoucher>, NetworkError>;
const INITIAL_STATE: VoucherListState = pot.none;

const reducer = (
  state: VoucherListState = INITIAL_STATE,
  action: Action
): VoucherListState => {
  switch (action.type) {
    case getType(svGenerateVoucherStart):
      return INITIAL_STATE;
    case getType(svVoucherListGet.request):
      return pot.toLoading(state);
    case getType(svVoucherListGet.success):
      return pot.some(toIndexed(action.payload, v => v.id));
    case getType(svVoucherListGet.failure):
      return pot.toError(state, action.payload);
  }

  return state;
};

export default reducer;
