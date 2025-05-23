import { createClient } from "../../../../definitions/connectivity/client";
import { defaultRetryingFetch } from "../../../utils/fetch";

export const createConnectivityClient = (baseUrl: string) =>
  createClient({
    baseUrl,
    fetchApi: defaultRetryingFetch()
  });

export type ConnectivityClient = ReturnType<typeof createConnectivityClient>;
