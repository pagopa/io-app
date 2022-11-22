import { createFetchRequestForApi } from "@pagopa/ts-commons/lib/requests";
import {
  getSignatureRequestByIdDefaultDecoder,
  GetSignatureRequestByIdT
} from "../../../../definitions/fci/requestTypes";
import { SessionToken } from "../../../types/SessionToken";
import {
  tokenHeaderProducer,
  withBearerToken as withToken
} from "../../../utils/api";
import { defaultRetryingFetch } from "../../../utils/fetch";

const getSignatureDetailViewById: GetSignatureRequestByIdT = {
  method: "get",
  url: params => `/api/v1/sign/signature-requests/${params.id}`,
  headers: tokenHeaderProducer,
  query: _ => ({}),
  response_decoder: getSignatureRequestByIdDefaultDecoder()
};

// client for SignWithIO to handle API communications
export const BackendFciClient = (
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
    getSignatureDetailViewById: withBearerToken(
      createFetchRequestForApi(getSignatureDetailViewById, options)
    )
  };
};
