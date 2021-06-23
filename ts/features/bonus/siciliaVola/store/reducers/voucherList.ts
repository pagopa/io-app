import { Action } from "../../../../../store/actions/types";
import { getType } from "typesafe-actions";
import { svGenerateVoucherStart } from "../actions/voucherGeneration";
import * as pot from "italia-ts-commons/lib/pot";
import { SvVoucher } from "../../types/svVoucher";
import { IndexedById } from "../../../../../store/helpers/indexer";

export type VoucherListState = pot.Pot<IndexedById<SvVoucher>, Error>;
const INITIAL_STATE: VoucherListState = pot.none;

const reducer = (
  state: VoucherListState = INITIAL_STATE,
  action: Action
): VoucherListState => {
  switch (action.type) {
    case getType(svGenerateVoucherStart):
      return INITIAL_STATE;
  }

  return state;
};

export default reducer;
