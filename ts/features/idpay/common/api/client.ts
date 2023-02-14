import { createClient } from "../../../../../definitions/idpay/client";
import { defaultRetryingFetch } from "../../../../utils/fetch";

const createIDPayClient = (baseUrl: string) =>
  createClient({
    baseUrl,
    fetchApi: defaultRetryingFetch()
  });

export type IDPayClient = ReturnType<typeof createIDPayClient>;

export { createIDPayClient };
