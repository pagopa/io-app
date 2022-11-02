import { createClient } from "../../../../../definitions/idpay/onboarding/client";
import { defaultRetryingFetch } from "../../../../utils/fetch";

const createOnboardingClient = (baseUrl: string, token: string) =>
  createClient<"bearerAuth">({
    baseUrl,
    fetchApi: defaultRetryingFetch(),
    withDefaults: op => params => {
      const paramsWithDefaults = {
        ...params,
        bearerAuth: `Bearer ${token}`
      } as Parameters<typeof op>[0];

      return op(paramsWithDefaults);
    }
  });

export type OnboardingClient = ReturnType<typeof createOnboardingClient>;

export { createOnboardingClient };
