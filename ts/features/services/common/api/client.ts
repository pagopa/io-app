import { createClient } from "../../../../../definitions/services/client";
import { SessionToken } from "../../../../types/SessionToken";
import { defaultRetryingFetch } from "../../../../utils/fetch";

export const createServicesClient = (baseUrl: string, token: SessionToken) =>
  createClient<"Bearer">({
    baseUrl,
    fetchApi: defaultRetryingFetch(),
    withDefaults: op => params =>
      op({
        ...params,
        Bearer: `Bearer ${token}`
      })
  });

export type ServicesClient = ReturnType<typeof createServicesClient>;
