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
  getUserLegalMessageDefaultDecoder,
  GetUserLegalMessageT
} from "../../../../definitions/backend/requestTypes";

const getUserLegalMessage: GetUserLegalMessageT = {
  method: "get",
  url: ({ id }) => `/api/v1/legal-messages/${id}`,
  headers: composeHeaderProducers(tokenHeaderProducer, ApiHeaderJson),
  query: _ => ({}),
  response_decoder: getUserLegalMessageDefaultDecoder()
};

// client for MVL to handle API communications
export const BackendMvlClient = (
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
      createFetchRequestForApi(getUserLegalMessage, options)
    )
  };
};

export type BackendMvlClient = ReturnType<typeof BackendMvlClient>;
