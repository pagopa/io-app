import {
  ActionType,
  createAsyncAction,
  createStandardAction
} from "typesafe-actions";
import { NetworkError } from "../../../../../utils/errors";
import { OnlineMerchants } from "../../../../../../definitions/cgn/merchants/OnlineMerchants";
import { OfflineMerchants } from "../../../../../../definitions/cgn/merchants/OfflineMerchants";
import { Merchant } from "../../../../../../definitions/cgn/merchants/Merchant";
import { OfflineMerchantSearchRequest } from "../../../../../../definitions/cgn/merchants/OfflineMerchantSearchRequest";
import { OnlineMerchantSearchRequest } from "../../../../../../definitions/cgn/merchants/OnlineMerchantSearchRequest";
import { Discount } from "../../../../../../definitions/cgn/merchants/Discount";

/**
 * get and handle list of online merchants conventioned with CGN
 */
export const cgnOnlineMerchants = createAsyncAction(
  "CGN_ONLINE_MERCHANTS_REQUEST",
  "CGN_ONLINE_MERCHANTS_SUCCESS",
  "CGN_ONLINE_MERCHANTS_FAILURE"
)<OnlineMerchantSearchRequest, OnlineMerchants["items"], NetworkError>();

/**
 * get and handle list of online merchants conventioned with CGN
 */
export const cgnOfflineMerchants = createAsyncAction(
  "CGN_OFFLINE_MERCHANTS_REQUEST",
  "CGN_OFFLINE_MERCHANTS_SUCCESS",
  "CGN_OFFLINE_MERCHANTS_FAILURE"
)<OfflineMerchantSearchRequest, OfflineMerchants["items"], NetworkError>();

export const cgnSelectedMerchant = createAsyncAction(
  "CGN_SELECTED_MERCHANT_REQUEST",
  "CGN_SELECTED_MERCHANT_SUCCESS",
  "CGN_SELECTED_MERCHANT_FAILURE"
)<Merchant["id"], Merchant, NetworkError>();

export const selectMerchantDiscount = createStandardAction(
  "CGN_SELECT_MERCHANT_DISCOUNT"
)<Discount>();

export const setMerchantDiscountCode = createStandardAction(
  "CGN_SET_MERCHANT_DISCOUNT_CODE"
)<string>();

export const resetMerchantDiscountCode = createStandardAction(
  "CGN_RESET_MERCHANT_DISCOUNT_CODE"
)<void>();

export type CgnMerchantsAction =
  | ActionType<typeof cgnOfflineMerchants>
  | ActionType<typeof cgnOnlineMerchants>
  | ActionType<typeof cgnSelectedMerchant>
  | ActionType<typeof selectMerchantDiscount>
  | ActionType<typeof setMerchantDiscountCode>
  | ActionType<typeof resetMerchantDiscountCode>;
