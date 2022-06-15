import {
  ApiHeaderJson,
  composeHeaderProducers,
  createFetchRequestForApi
} from "italia-ts-commons/lib/requests";
import { SessionToken } from "../../../types/SessionToken";
import { defaultRetryingFetch } from "../../../utils/fetch";

import {
  tokenHeaderProducer,
  withBearerToken as withToken
} from "../../../utils/api";
import {
  getThirdPartyMessageDefaultDecoder,
  GetThirdPartyMessageT
} from "../../../../definitions/backend/requestTypes";

const getThirdPartyMessage: GetThirdPartyMessageT = {
  method: "get",
  url: ({ id }) => `/api/v1/third-party-messages/${id}`,
  headers: composeHeaderProducers(tokenHeaderProducer, ApiHeaderJson),
  query: _ => ({}),
  response_decoder: getThirdPartyMessageDefaultDecoder()
};

// client for PN to handle API communications
export const BackendPN = (
  baseUrl: string,
  token: SessionToken,
  fetchApi: typeof fetch = defaultRetryingFetch()
) => {
  const options = {
    baseUrl,
    fetchApi
  };
  const withBearerToken = withToken(token);
  return {
    getUserLegalMessage: withBearerToken(
      createFetchRequestForApi(getThirdPartyMessage, options)
    )
  };
};
