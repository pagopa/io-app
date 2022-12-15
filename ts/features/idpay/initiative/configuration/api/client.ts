import { createClient } from "../../../../../../definitions/idpay/iban/client";
import { defaultRetryingFetch } from "../../../../../utils/fetch";

const createIDPayIbanClient = (baseUrl: string) =>
  createClient({
    baseUrl,
    fetchApi: defaultRetryingFetch()
  });

export type IDPayIbanClient = ReturnType<typeof createIDPayIbanClient>;

export { createIDPayIbanClient };
