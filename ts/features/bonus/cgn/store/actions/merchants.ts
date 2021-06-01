import { ActionType, createAsyncAction } from "typesafe-actions";
import { NetworkError } from "../../../../../utils/errors";
import { OnlineMerchants } from "../../../../../../definitions/cgn/merchants/OnlineMerchants";
import { OfflineMerchants } from "../../../../../../definitions/cgn/merchants/OfflineMerchants";
import { Merchant } from "../../../../../../definitions/cgn/merchants/Merchant";

/**
 * get and handle list of online merchants conventioned with CGN
 * TODO request action should contain filtering options
 */
export const cgnOnlineMerchants = createAsyncAction(
  "CGN_ONLINE_MERCHANTS_REQUEST",
  "CGN_ONLINE_MERCHANTS_SUCCESS",
  "CGN_ONLINE_MERCHANTS_FAILURE"
)<void, OnlineMerchants["items"], NetworkError>();

/**
 * get and handle list of online merchants conventioned with CGN
 * TODO request action should contain filtering options
 */
export const cgnOfflineMerchants = createAsyncAction(
  "CGN_OFFLINE_MERCHANTS_REQUEST",
  "CGN_OFFLINE_MERCHANTS_SUCCESS",
  "CGN_OFFLINE_MERCHANTS_FAILURE"
)<void, OfflineMerchants["items"], NetworkError>();

export const cgnSelectedMerchant = createAsyncAction(
  "CGN_SELECTED_MERCHANT_REQUEST",
  "CGN_SELECTED_MERCHANT_SUCCESS",
  "CGN_SELECTED_MERCHANT_FAILURE"
)<Merchant["id"], Merchant, NetworkError>();

export type CgnMerchantsAction =
  | ActionType<typeof cgnOfflineMerchants>
  | ActionType<typeof cgnOnlineMerchants>
  | ActionType<typeof cgnSelectedMerchant>;
