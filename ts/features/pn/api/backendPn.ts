import {
  createFetchRequestForApi,
  ApiHeaderJson,
  composeHeaderProducers
} from "italia-ts-commons/lib/requests";
import {
  upsertPNActivationDefaultDecoder,
  UpsertPNActivationT
} from "../../../../definitions/pn/requestTypes";
import { SessionToken } from "../../../types/SessionToken";
import { tokenHeaderProducer, withBearerToken } from "../../../utils/api";
import { defaultRetryingFetch } from "../../../utils/fetch";

const upsertActivation: UpsertPNActivationT = {
  method: "post",
  url: _ => `/api/v1/pn/activation`,
  headers: tokenHeaderProducer,
  query: _ => ({}),
  body: body => JSON.stringify(body.pNActivation),
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
      createFetchRequestForApi(upsertActivation, options)
    )
  };
};

export type BackendPnClient = ReturnType<typeof BackendPnClient>;
