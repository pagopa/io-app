import { createClient } from "../../../../../definitions/idpay/wallet/client";
import { defaultRetryingFetch } from "../../../../utils/fetch";

const createIDPayWalletClient = (baseUrl: string, token: string) =>
  createClient<"bearerAuth">({
    baseUrl,
    fetchApi: defaultRetryingFetch(),
    withDefaults: op => params => {
      const paramsWithDefaults = {
        ...params,
        bearerAuth: token
      } as Parameters<typeof op>[0];

      return op(paramsWithDefaults);
    }
  });

export type IDPayWalletClient = ReturnType<typeof createIDPayWalletClient>;

export { createIDPayWalletClient };
