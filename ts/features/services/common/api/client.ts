import { createClient } from "../../../../../definitions/services/client";
import { defaultRetryingFetch } from "../../../../utils/fetch";

export const createServicesClient = (baseUrl: string) =>
  createClient({
    baseUrl,
    fetchApi: defaultRetryingFetch()
  });

export type ServicesClient = ReturnType<typeof createServicesClient>;
