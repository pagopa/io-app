import { createClient } from "../../../../../definitions/idpay/onboarding/client";
import { defaultRetryingFetch } from "../../../../utils/fetch";

const createOnboardingClient = (baseUrl: string) =>
  createClient({
    baseUrl,
    fetchApi: defaultRetryingFetch()
  });

export type OnboardingClient = ReturnType<typeof createOnboardingClient>;

export { createOnboardingClient };
