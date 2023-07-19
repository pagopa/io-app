import { createClient } from "../../../../../definitions/idpay/client";
import { defaultRetryingFetch } from "../../../../utils/fetch";

const createWalletClient = (baseUrl: string) =>
  createClient({
    baseUrl,
    fetchApi: defaultRetryingFetch()
  });

export type WalletClient = ReturnType<typeof createWalletClient>;

export { createWalletClient };
