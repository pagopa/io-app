import { createClient } from "../../../../../definitions/services/client";
import { defaultRetryingFetch } from "../../../../utils/fetch";

export const createServicesClient = (baseUrl: string) =>
  createClient<"ApiKeyAuth">({
    baseUrl,
    fetchApi: defaultRetryingFetch(),
    withDefaults: op => params => op({
      ...params,
      ApiKeyAuth: ""
    })
  });

export type ServicesClient = ReturnType<typeof createServicesClient>;
