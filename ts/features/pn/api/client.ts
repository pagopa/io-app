import { createClient } from "../../../../definitions/pn/client";
import { SessionToken } from "../../../types/SessionToken";
import { defaultRetryingFetch } from "../../../utils/fetch";

export const createPnClient = (baseUrl: string, token: SessionToken) =>
  createClient<"Bearer">({
    baseUrl,
    fetchApi: defaultRetryingFetch(),
    withDefaults: op => params =>
      op({
        ...params,
        Bearer: `Bearer ${token}`
      })
  });

export type PnClient = ReturnType<typeof createPnClient>;
