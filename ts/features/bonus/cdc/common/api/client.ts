import { createClient } from "../../../../../../definitions/cdc/client";
import { defaultRetryingFetch } from "../../../../../utils/fetch";

export const createCdcClient = (baseUrl: string, sessionToken: string) =>
  createClient<"Bearer">({
    baseUrl,
    basePath: "/session-wallet/v1",
    fetchApi: defaultRetryingFetch(),
    withDefaults: op => params => {
      const paramsWithDefaults = {
        ...params,
        Bearer: sessionToken
      } as Parameters<typeof op>[0];

      return op(paramsWithDefaults);
    }
  });

export type CdcClient = ReturnType<typeof createCdcClient>;
