import { createClient } from "../../../../../definitions/pagopa/walletv3/client";
import { createClient as createECommerceClient } from "../../../../../definitions/pagopa/ecommerce/client";
import { createClient as createBizEventsClient } from "../../../../../definitions/pagopa/biz-events/client";
import { createClient as createPagoPaPlatformClient } from "../../../../../definitions/pagopa/platform/client";
import { defaultRetryingFetch } from "../../../../utils/fetch";

export const createWalletClient = (baseUrl: string) =>
  createClient({
    baseUrl,
    basePath: "/io-payment-wallet/v1",
    fetchApi: defaultRetryingFetch()
  });

export const createPaymentClient = (baseUrl: string) =>
  createECommerceClient({
    baseUrl,
    basePath: "/ecommerce/io/v2",
    fetchApi: defaultRetryingFetch()
  });

export const createTransactionClient = (baseUrl: string) =>
  createBizEventsClient({
    baseUrl,
    basePath: "/bizevents/notices-service-jwt/v1",
    fetchApi: defaultRetryingFetch()
  });

export const createPagoPaClient = (baseUrl: string, walletToken: string) =>
  createPagoPaPlatformClient<"Authorization">({
    baseUrl,
    basePath: "/session-wallet/v1",
    fetchApi: defaultRetryingFetch(),
    withDefaults: op => params => {
      const paramsWithDefaults = {
        ...params,
        Authorization: walletToken
      } as Parameters<typeof op>[0];

      return op(paramsWithDefaults);
    }
  });

export type PaymentClient = ReturnType<typeof createPaymentClient>;
export type WalletClient = ReturnType<typeof createWalletClient>;
export type TransactionClient = ReturnType<typeof createTransactionClient>;
export type PagoPaClient = ReturnType<typeof createPagoPaClient>;
