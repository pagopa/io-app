import { createClient } from "../../../../../definitions/idpay/wallet/client";
import { defaultRetryingFetch } from "../../../../utils/fetch";

const createIDPayWalletClient = (baseUrl: string) =>
  createClient({
    baseUrl,
    fetchApi: defaultRetryingFetch()
  });

export type IDPayWalletClient = ReturnType<typeof createIDPayWalletClient>;

export { createIDPayWalletClient };
