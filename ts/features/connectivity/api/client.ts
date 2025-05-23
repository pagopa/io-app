import { createClient } from "../../../../definitions/connectivity/client";
import { defaultRetryingFetch } from "../../../utils/fetch";

export const createConnectivityClient = (baseUrl: string) =>
  createClient({
    baseUrl,
    fetchApi: defaultRetryingFetch(),
    basePath: ""
  });

export type ConnectivityClient = ReturnType<typeof createConnectivityClient>;
