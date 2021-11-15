import {
  ActionType,
  createAsyncAction,
  createStandardAction
} from "typesafe-actions";
import { NetworkError } from "../../../../../utils/errors";
import { SvVoucher, SvVoucherId } from "../../types/SvVoucher";
import { VoucherBeneficiarioInputBean } from "../../../../../../definitions/api_sicilia_vola/VoucherBeneficiarioInputBean";
import { SvVoucherListResponse } from "../../types/SvVoucherResponse";
import { StatoVoucherBeanList } from "../../../../../../definitions/api_sicilia_vola/StatoVoucherBeanList";
import { FilterState } from "../reducers/voucherList/filters";

/**
 * get and handle the voucher list
 */
export const svVoucherListGet = createAsyncAction(
  "SV_VOUCHER_LIST_GET_REQUEST",
  "SV_VOUCHER_LIST_GET_SUCCESS",
  "SV_VOUCHER_LIST_GET_FAILURE"
)<VoucherBeneficiarioInputBean, SvVoucherListResponse, NetworkError>();

/**
 * get and handle the possible voucher states
 */
export const svPossibleVoucherStateGet = createAsyncAction(
  "SV_POSSIBLE_VOUCHER_STATE_GET_REQUEST",
  "SV_POSSIBLE_VOUCHER_STATE_GET_SUCCESS",
  "SV_POSSIBLE_VOUCHER_STATE_GET_FAILURE"
)<void, StatoVoucherBeanList, NetworkError>();

/**
 * get and handle the voucher details
 */
export const svVoucherDetailGet = createAsyncAction(
  "SV_VOUCHER_DETAIL_GET_REQUEST",
  "SV_VOUCHER_DETAIL_GET_SUCCESS",
  "SV_VOUCHER_DETAIL_GET_FAILURE"
)<SvVoucherId, SvVoucher, NetworkError>();

/**
 * handle the voucher revocation
 */
export const svVoucherRevocation = createAsyncAction(
  "SV_VOUCHER_REVOCATION_REQUEST",
  "SV_VOUCHER_REVOCATION_GET_SUCCESS",
  "SV_VOUCHER_REVOCATION_GET_FAILURE"
)<SvVoucherId, void, NetworkError>();

/**
 * The user chooses the filter to make the voucher research
 */
export const svSetFilter = createStandardAction("SV_SET_FILTER")<FilterState>();

/**
 * The user chooses the voucher to see the details
 */
export const svSelectVoucher =
  createStandardAction("SV_SELECT_VOUCHER")<SvVoucherId>();

export type SvVoucherListActions =
  | ActionType<typeof svVoucherListGet>
  | ActionType<typeof svPossibleVoucherStateGet>
  | ActionType<typeof svVoucherDetailGet>
  | ActionType<typeof svVoucherRevocation>
  | ActionType<typeof svSetFilter>
  | ActionType<typeof svSelectVoucher>;
