import { createClient } from "../../../../../definitions/fims_history/client";
import { defaultRetryingFetch } from "../../../../utils/fetch";

export const createFimsClient = (baseUrl: string) =>
  createClient({
    baseUrl,
    fetchApi: defaultRetryingFetch()
  });

export type FimsHistoryClient = ReturnType<typeof createFimsClient>;
