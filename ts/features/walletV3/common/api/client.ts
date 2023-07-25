import { createClient } from "../../../../../definitions/pagopa/walletv3/client";
import { defaultRetryingFetch } from "../../../../utils/fetch";

const createWalletClient = (baseUrl: string) =>
  createClient({
    baseUrl,
    basePath: "",
    fetchApi: defaultRetryingFetch()
  });

export type WalletClient = ReturnType<typeof createWalletClient>;

export { createWalletClient };
