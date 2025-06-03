import { createClient } from "../../../../definitions/platform/client";
import { SessionToken } from "../../../types/SessionToken";
import { defaultRetryingFetch } from "../../../utils/fetch";

export const createTrialSystemClient = (baseUrl: string, token: SessionToken) =>
  createClient({
    baseUrl,
    basePath: "/api/v1",
    fetchApi: defaultRetryingFetch(),
    withDefaults: op => params =>
      op({
        ...params,
        Bearer: `${token}`
      })
  });

export type TrialSystemClient = ReturnType<typeof createTrialSystemClient>;
