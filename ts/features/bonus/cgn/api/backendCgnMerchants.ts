import {
  ApiHeaderJson,
  composeHeaderProducers,
  createFetchRequestForApi
} from "italia-ts-commons/lib/requests";
import { defaultRetryingFetch } from "../../../../utils/fetch";
import {
  getDiscountBucketCodeDefaultDecoder,
  GetDiscountBucketCodeT,
  getMerchantDefaultDecoder,
  GetMerchantT,
  getOfflineMerchantsDefaultDecoder,
  GetOfflineMerchantsT,
  getOnlineMerchantsDefaultDecoder,
  GetOnlineMerchantsT
} from "../../../../../definitions/cgn/merchants/requestTypes";
import { tokenHeaderProducer, withBearerToken } from "../../../../utils/api";

const BASE_URL = "/api/v1/cgn-operator-search";

const getOnlineMerchants: GetOnlineMerchantsT = {
  method: "post",
  url: () => `${BASE_URL}/online-merchants`,
  query: _ => ({}),
  body: ({ onlineMerchantSearchRequest }) =>
    JSON.stringify(onlineMerchantSearchRequest),
  headers: composeHeaderProducers(tokenHeaderProducer, ApiHeaderJson),
  response_decoder: getOnlineMerchantsDefaultDecoder()
};

const getOfflineMerchants: GetOfflineMerchantsT = {
  method: "post",
  url: () => `${BASE_URL}/offline-merchants`,
  query: _ => ({}),
  body: ({ offlineMerchantSearchRequest }) =>
    JSON.stringify(offlineMerchantSearchRequest),
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
    )
  };
}
