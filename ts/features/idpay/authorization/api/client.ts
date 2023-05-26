import { createClient } from "../../../../../definitions/idpay_payment/client";
import { defaultRetryingFetch } from "../../../../utils/fetch";

const createIDPayAuthorizationClient = (baseUrl: string) =>
  createClient({
    baseUrl,
    fetchApi: defaultRetryingFetch()
  });

export type IDPayAuthorizationClient = ReturnType<
  typeof createIDPayAuthorizationClient
>;

export { createIDPayAuthorizationClient };
