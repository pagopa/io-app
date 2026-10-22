import { createClient } from "@io-app/api-types/generated/definitions/idpay/client";
import {
  getTimelineDecoder,
  GetTimelineT
} from "@io-app/api-types/generated/definitions/idpay/requestTypes";
import {
  createFetchRequestForApi,
  MapResponseType,
  ReplaceRequestParams,
  RequestParams
} from "@pagopa/ts-commons/lib/requests";
import { withoutUndefinedValues } from "@pagopa/ts-commons/lib/types";
import { OutputOf } from "io-ts";

import { defaultRetryingFetch } from "../../../../utils/fetch";
import { TimelineDTO } from "./timeline";

type GetTimelineRequest = ReplaceRequestParams<
  MapResponseType<GetTimelineT, 200, TimelineDTO>,
  Omit<RequestParams<GetTimelineT>, "x-Api-Version">
>;

const createIDPayClient = (baseUrl: string, apiVersion: string) => {
  const fetchApi = defaultRetryingFetch();
  const client = createClient<"x-Api-Version">({
    baseUrl,
    fetchApi,
    withDefaults: op => params => {
      const paramsWithDefaults = {
        ...params,
        "x-Api-Version": apiVersion
      } as Parameters<typeof op>[0];

      return op(paramsWithDefaults);
    },
    basePath: "/idpay-itn"
  });

  const getTimelineRequest: GetTimelineRequest = {
    method: "get",
    headers: ({ bearerAuth, "Accept-Language": language }) => ({
      Authorization: `Bearer ${bearerAuth}`,
      "x-Api-Version": apiVersion,
      "Accept-Language": language
    }),
    url: ({ initiativeId }) => `/idpay-itn/timeline/${initiativeId}`,
    query: ({ operationType, page, size }) =>
      withoutUndefinedValues({ operationType, page, size }),
    response_decoder: getTimelineDecoder<
      TimelineDTO,
      OutputOf<typeof TimelineDTO>
    >({
      200: TimelineDTO
    })
  };

  return {
    ...client,
    getTimeline: createFetchRequestForApi(getTimelineRequest, {
      baseUrl,
      fetchApi
    })
  };
};

export type IDPayClient = ReturnType<typeof createIDPayClient>;

export { createIDPayClient };
