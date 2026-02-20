import { createClient } from "../../../../../definitions/services/client";
import { defaultRetryingFetch } from "../../../../utils/fetch";

export const createServicesClient = (baseUrl: string, token: string) =>
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
