import { createClient } from "../../../../../../definitions/idpay/timeline/client";
import { defaultRetryingFetch } from "../../../../../utils/fetch";

const createIDPayTimelineClient = (baseUrl: string) =>
  createClient({
    baseUrl,
    fetchApi: defaultRetryingFetch()
  });

export type IDPayTimelineClient = ReturnType<typeof createIDPayTimelineClient>;

export { createIDPayTimelineClient };
