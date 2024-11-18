import { createClient } from "../../../../../definitions/fims/client";
import { defaultRetryingFetch } from "../../../../utils/fetch";

export const createFimsClient = (baseUrl: string) =>
  createClient({
    baseUrl,
    fetchApi: defaultRetryingFetch()
  });

export type FimsHistoryClient = ReturnType<typeof createFimsClient>;
