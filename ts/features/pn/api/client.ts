import { createClient } from "../../../../definitions/pn/client";
import { fetchMaxRetries, fetchTimeout } from "../../../config";
import { defaultRetryingFetch } from "../../../utils/fetch";

export const createPnClient = (baseUrl: string, token: string) =>
  createClient<"Bearer">({
    baseUrl,
    fetchApi: defaultRetryingFetch(fetchTimeout, fetchMaxRetries, 418), // mock status code to force no retry, for custom 429 handling
    withDefaults: op => params =>
      op({
        ...params,
        Bearer: `Bearer ${token}`
      })
  });

export type PnClient = ReturnType<typeof createPnClient>;
