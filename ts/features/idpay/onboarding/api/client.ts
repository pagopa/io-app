import { createClient } from "../../../../../definitions/idpay/onboarding/client";
import { defaultRetryingFetch } from "../../../../utils/fetch";

const createOnboardingClient = (baseUrl: string, _token: string) =>
  createClient({
    baseUrl,
    fetchApi: defaultRetryingFetch()
  });

export { createOnboardingClient };
