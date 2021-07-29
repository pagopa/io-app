import { ActionType, createAsyncAction } from "typesafe-actions";
import { NetworkError } from "../../../../../utils/errors";
import { SvVoucher } from "../../types/svVoucher";

/**
 * get and handle the available state
 */
export const svVoucherListGet = createAsyncAction(
  "SV_VOUCHER_LIST_GET_REQUEST",
  "SV_VOUCHER_LIST_GET_SUCCESS",
  "SV_VOUCHER_LIST_GET_FAILURE"
)<void, ReadonlyArray<SvVoucher>, NetworkError>();

export type SvVoucherListActions = ActionType<typeof svVoucherListGet>;
