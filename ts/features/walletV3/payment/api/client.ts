import { createClient } from "../../../../../definitions/pagopa/ecommerce/client";
import { defaultRetryingFetch } from "../../../../utils/fetch";

const createPaymentClient = (baseUrl: string, token: string) =>
  createClient<"walletToken">({
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

export { createPaymentClient };
