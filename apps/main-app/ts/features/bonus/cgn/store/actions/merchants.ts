import { CountResult } from "@io-app/api-types/generated/definitions/cgn/merchants/CountResult";
import { Discount } from "@io-app/api-types/generated/definitions/cgn/merchants/Discount";
import { Merchant } from "@io-app/api-types/generated/definitions/cgn/merchants/Merchant";
import { OfflineMerchants } from "@io-app/api-types/generated/definitions/cgn/merchants/OfflineMerchants";
import { OfflineMerchantSearchRequest } from "@io-app/api-types/generated/definitions/cgn/merchants/OfflineMerchantSearchRequest";
import { OnlineMerchants } from "@io-app/api-types/generated/definitions/cgn/merchants/OnlineMerchants";
import { OnlineMerchantSearchRequest } from "@io-app/api-types/generated/definitions/cgn/merchants/OnlineMerchantSearchRequest";
import { SearchRequest } from "@io-app/api-types/generated/definitions/cgn/merchants/SearchRequest";
import { SearchResult } from "@io-app/api-types/generated/definitions/cgn/merchants/SearchResult";
import { CgnFeaturedOpportunity } from "@io-app/api-types/generated/definitions/content/CgnFeaturedOpportunity";
import {
  ActionType,
  createAsyncAction,
  createStandardAction
} from "typesafe-actions";

import { NetworkError } from "../../../../../utils/errors";

export const CGN_FEATURED_OPPORTUNITIES_MAX_ITEMS = 3;

export type ResolvedCgnFeaturedOpportunity = Readonly<{
  discount: Discount;
  merchant: Merchant;
}>;

export const cgnFeaturedOpportunities = createAsyncAction(
  "CGN_FEATURED_OPPORTUNITIES_REQUEST",
  "CGN_FEATURED_OPPORTUNITIES_SUCCESS",
  "CGN_FEATURED_OPPORTUNITIES_FAILURE"
)<
  ReadonlyArray<CgnFeaturedOpportunity>,
  ReadonlyArray<ResolvedCgnFeaturedOpportunity>,
  NetworkError
>();

/** Count merchants conventioned with CGN */
export const cgnMerchantsCount = createAsyncAction(
  "CGN_MERCHANTS_COUNT_REQUEST",
  "CGN_MERCHANTS_COUNT_SUCCESS",
  "CGN_MERCHANTS_COUNT_FAILURE"
)<void, CountResult, NetworkError>();

/** Search merchants conventioned with CGN */
export const cgnSearchMerchants = createAsyncAction(
  "CGN_SEARCH_MERCHANTS_REQUEST",
  "CGN_SEARCH_MERCHANTS_SUCCESS",
  "CGN_SEARCH_MERCHANTS_FAILURE"
)<SearchRequest, SearchResult["items"], NetworkError>();

/** Get and handle list of online merchants conventioned with CGN */
export const cgnOnlineMerchants = createAsyncAction(
  "CGN_ONLINE_MERCHANTS_REQUEST",
  "CGN_ONLINE_MERCHANTS_SUCCESS",
  "CGN_ONLINE_MERCHANTS_FAILURE"
)<OnlineMerchantSearchRequest, OnlineMerchants["items"], NetworkError>();

/** Get and handle list of online merchants conventioned with CGN */
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

/**
 * Selects a featured merchant and discount in one step. It also cancels any
 * pending `cgnSelectedMerchant` request, so it can't overwrite this selection
 */
export const selectFeaturedOpportunity = createStandardAction(
  "CGN_SELECT_FEATURED_OPPORTUNITY"
)<ResolvedCgnFeaturedOpportunity>();

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
  | ActionType<typeof cgnFeaturedOpportunities>
  | ActionType<typeof cgnMerchantsCount>
  | ActionType<typeof cgnOfflineMerchants>
  | ActionType<typeof cgnOnlineMerchants>
  | ActionType<typeof cgnSearchMerchants>
  | ActionType<typeof cgnSelectedMerchant>
  | ActionType<typeof resetMerchantDiscountCode>
  | ActionType<typeof selectFeaturedOpportunity>
  | ActionType<typeof selectMerchantDiscount>
  | ActionType<typeof setMerchantDiscountCode>;
