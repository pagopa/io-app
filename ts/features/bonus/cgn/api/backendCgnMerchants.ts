import {
  ApiHeaderJson,
  composeHeaderProducers,
  createFetchRequestForApi
} from "@pagopa/ts-commons/lib/requests";
import {
  getDiscountBucketCodeDefaultDecoder,
  GetDiscountBucketCodeT,
  getMerchantDefaultDecoder,
  GetMerchantT,
  getOfflineMerchantsDefaultDecoder,
  GetOfflineMerchantsT,
  getOnlineMerchantsDefaultDecoder,
  GetOnlineMerchantsT,
  getPublishedProductCategoriesDefaultDecoder,
  GetPublishedProductCategoriesT
} from "../../../../../definitions/cgn/merchants/requestTypes";
import { tokenHeaderProducer, withBearerToken } from "../../../../utils/api";
import { defaultRetryingFetch } from "../../../../utils/fetch";

const BASE_URL = "/api/v1/cgn/operator-search";

const getOnlineMerchants: GetOnlineMerchantsT = {
  method: "post",
  url: () => `${BASE_URL}/online-merchants`,
  query: _ => ({}),
  body: ({ body }) => JSON.stringify(body),
  headers: composeHeaderProducers(tokenHeaderProducer, ApiHeaderJson),
  response_decoder: getOnlineMerchantsDefaultDecoder()
};

const getOfflineMerchants: GetOfflineMerchantsT = {
  method: "post",
  url: () => `${BASE_URL}/offline-merchants`,
  query: _ => ({}),
  body: ({ body }) => JSON.stringify(body),
  headers: composeHeaderProducers(tokenHeaderProducer, ApiHeaderJson),
  response_decoder: getOfflineMerchantsDefaultDecoder()
};

const getMerchant: GetMerchantT = {
  method: "get",
  url: params => `${BASE_URL}/merchants/${params.merchantId}`,
  query: _ => ({}),
  headers: composeHeaderProducers(tokenHeaderProducer, ApiHeaderJson),
  response_decoder: getMerchantDefaultDecoder()
};

const getDiscountBucketCode: GetDiscountBucketCodeT = {
  method: "get",
  url: params => `${BASE_URL}/discount-bucket-code/${params.discountId}`,
  query: _ => ({}),
  headers: composeHeaderProducers(tokenHeaderProducer, ApiHeaderJson),
  response_decoder: getDiscountBucketCodeDefaultDecoder()
};

const getPublishedCategories: GetPublishedProductCategoriesT = {
  method: "get",
  url: () => `${BASE_URL}/published-product-categories`,
  query: ({ count_new_discounts }) => ({
    count_new_discounts
  }),
  headers: composeHeaderProducers(tokenHeaderProducer, ApiHeaderJson),
  response_decoder: getPublishedProductCategoriesDefaultDecoder()
};

//
// A specific backend client to handle cgn requests
//
export function BackendCgnMerchants(
  baseUrl: string,
  token: string,
  fetchApi: typeof fetch = defaultRetryingFetch()
) {
  const options = {
    baseUrl,
    fetchApi
  };

  const withToken = withBearerToken(token);

  return {
    getOnlineMerchants: withToken(
      createFetchRequestForApi(getOnlineMerchants, options)
    ),
    getOfflineMerchants: withToken(
      createFetchRequestForApi(getOfflineMerchants, options)
    ),
    getMerchant: withToken(createFetchRequestForApi(getMerchant, options)),
    getDiscountBucketCode: withToken(
      createFetchRequestForApi(getDiscountBucketCode, options)
    ),
    getPublishedCategories: withToken(
      createFetchRequestForApi(getPublishedCategories, options)
    )
  };
}
