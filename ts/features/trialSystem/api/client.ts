import { createClient } from "../../../../definitions/trial_system/client";
import { SessionToken } from "../../../types/SessionToken";
import { defaultRetryingFetch } from "../../../utils/fetch";

export const createTrialSystemClient = (baseUrl: string, token: SessionToken) =>
  createClient<"Bearer">({
    baseUrl,
    basePath: "/api/v1",
    fetchApi: defaultRetryingFetch(),
    withDefaults: op => params =>
      op({
        ...params,
        Bearer: `Bearer ${token}`
      })
  });

export type TrialSystemClient = ReturnType<typeof createTrialSystemClient>;
