import { createClient } from "../../../../../definitions/idpay/onboarding/client";

import { PreferredLanguageEnum } from "../../../../../definitions/backend/PreferredLanguage";
import { defaultRetryingFetch } from "../../../../utils/fetch";

const createOnboardingClient = (
  baseUrl: string,
  defaultsFunc: () => RequestInit
  token: string,
  language: PreferredLanguageEnum
) =>
  createClient<"bearerAuth" | "Accept-Language">({
    baseUrl,
    fetchApi: defaultRetryingFetch(),
    withDefaults:defaultsFunc
    // withDefaults: op => params => {
    //   const paramsWithDefaults = {
    //     ...params,
    //     bearerAuth: token
    //   };

    //   return op(paramsWithDefaults);
    // }
  });

export type OnboardingClient = ReturnType<typeof createOnboardingClient>;

export { createOnboardingClient };
