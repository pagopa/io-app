import { createClient } from "../../../../../../definitions/idpay/iban/client";
import { defaultRetryingFetch } from "../../../../../utils/fetch";

const createIbanClient = (baseUrl: string) =>
  createClient({
    baseUrl,
    fetchApi: defaultRetryingFetch()
  });

export type IbanClient = ReturnType<typeof createIbanClient>;

export { createIbanClient };
