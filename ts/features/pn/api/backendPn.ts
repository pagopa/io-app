import {
  ApiHeaderJson,
  composeHeaderProducers,
  createFetchRequestForApi
} from "@pagopa/ts-commons/lib/requests";
import {
  UpsertPNActivationT,
  upsertPNActivationDefaultDecoder
} from "../../../../definitions/pn/requestTypes";
import { SessionToken } from "../../../types/SessionToken";
import { tokenHeaderProducer, withBearerToken } from "../../../utils/api";
import { defaultRetryingFetch } from "../../../utils/fetch";

const upsertPNActivation: UpsertPNActivationT = {
  method: "post",
  url: _ => `/api/v1/pn/activation`,
  headers: composeHeaderProducers(tokenHeaderProducer, ApiHeaderJson),
  query: query => ({ isTest: query.isTest }),
  body: body => JSON.stringify(body.body),
  response_decoder: upsertPNActivationDefaultDecoder()
};

// client for handling PN endpoints
export const BackendPnClient = (
  baseUrl: string,
  token: SessionToken,
  fetchApi: typeof fetch = defaultRetryingFetch()
) => {
  const options = {
    baseUrl,
    fetchApi
  };

  const withToken = withBearerToken(token);

  return {
    upsertPnActivation: withToken(
      createFetchRequestForApi(upsertPNActivation, options)
    )
  };
};

export type BackendPnClient = ReturnType<typeof BackendPnClient>;
