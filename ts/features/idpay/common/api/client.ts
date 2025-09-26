import { createClient } from "../../../../../definitions/idpay/client";
import { defaultRetryingFetch } from "../../../../utils/fetch";

const createIDPayClient = (baseUrl: string, apiVersion: string) =>
  createClient<"x-Api-Version">({
    baseUrl,
    fetchApi: defaultRetryingFetch(),
    withDefaults: op => params => {
      const paramsWithDefaults = {
        ...params,
        "x-Api-Version": apiVersion
      } as Parameters<typeof op>[0];

      return op(paramsWithDefaults);
    },
    basePath: "/idpay-itn"
  });

export type IDPayClient = ReturnType<typeof createIDPayClient>;

export { createIDPayClient };
