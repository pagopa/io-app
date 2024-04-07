import { createClient } from "../../../../../definitions/pagopa/walletv3/client";
import { createClient as createECommerceClient } from "../../../../../definitions/pagopa/ecommerce/client";
import { defaultRetryingFetch } from "../../../../utils/fetch";

export const createWalletClient = (baseUrl: string, bearerAuth: string) =>
  createClient<"bearerAuth">({
    baseUrl,
    basePath: "/payment-wallet/v1",
    fetchApi: defaultRetryingFetch(),
    withDefaults: op => params => {
      const paramsWithDefaults = {
        ...params,
        bearerAuth
      } as Parameters<typeof op>[0];

      return op(paramsWithDefaults);
    }
  });

export const createPaymentClient = (baseUrl: string, token: string) =>
  createECommerceClient<"walletToken">({
    baseUrl,
    basePath: "/ecommerce/io/v1",
    fetchApi: defaultRetryingFetch(),
    withDefaults: op => params => {
      const paramsWithDefaults = {
        ...params,
        walletToken: token
      } as Parameters<typeof op>[0];

      return op(paramsWithDefaults);
    }
  });

export type PaymentClient = ReturnType<typeof createPaymentClient>;
export type WalletClient = ReturnType<typeof createWalletClient>;
