import { ActionType, createAsyncAction } from "typesafe-actions";
import { NetworkError } from "../../../../../utils/errors";
import { SvVoucher } from "../../types/SvVoucher";
import { VoucherBeneficiarioInputBean } from "../../../../../../definitions/api_sicilia_vola/VoucherBeneficiarioInputBean";
import { SvVoucherListResponse } from "../../types/SvVoucherResponse";

/**
 * get and handle the voucher list
 */
export const svVoucherListGet = createAsyncAction(
  "SV_VOUCHER_LIST_GET_REQUEST",
  "SV_VOUCHER_LIST_GET_SUCCESS",
  "SV_VOUCHER_LIST_GET_FAILURE"
)<VoucherBeneficiarioInputBean, SvVoucherListResponse, NetworkError>();

/**
 * get and handle the voucher list
 */
export const svVoucherDetailGet = createAsyncAction(
  "SV_VOUCHER_DETAIL_GET_REQUEST",
  "SV_VOUCHER_DETAIL_GET_SUCCESS",
  "SV_VOUCHER_DETAIL_GET_FAILURE"
)<number, SvVoucher, NetworkError>();

export type SvVoucherListActions =
  | ActionType<typeof svVoucherListGet>
  | ActionType<typeof svVoucherDetailGet>;
