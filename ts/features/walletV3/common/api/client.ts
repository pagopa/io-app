import { createClient } from "../../../../../definitions/pagopa/walletv3/client";
import { defaultRetryingFetch } from "../../../../utils/fetch";

const createWalletClient = (baseUrl: string, bearerAuth: string) =>
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

export type WalletClient = ReturnType<typeof createWalletClient>;

export { createWalletClient };
