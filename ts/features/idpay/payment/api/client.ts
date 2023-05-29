import { createClient } from "../../../../../definitions/idpay_payment/client";
import { defaultRetryingFetch } from "../../../../utils/fetch";

const createIDPayPaymentClient = (baseUrl: string) =>
  createClient({
    baseUrl,
    fetchApi: defaultRetryingFetch()
  });

export type IDPayPaymentClient = ReturnType<typeof createIDPayPaymentClient>;

export { createIDPayPaymentClient };
