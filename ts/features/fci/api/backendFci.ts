import {
  ApiHeaderJson,
  composeHeaderProducers,
  createFetchRequestForApi
} from "@pagopa/ts-commons/lib/requests";
import {
  getSignatureRequestByIdDefaultDecoder,
  GetSignatureRequestByIdT,
  CreateFilledDocumentT,
  createFilledDocumentDefaultDecoder,
  GetQtspClausesMetadataT,
  getQtspClausesMetadataDefaultDecoder
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

const getQtspClausesMetadata: GetQtspClausesMetadataT = {
  method: "get",
  url: () => `/api/v1/sign/qtsp/clauses`,
  headers: tokenHeaderProducer,
  query: _ => ({}),
  response_decoder: getQtspClausesMetadataDefaultDecoder()
};

const postQtspFilledBody: CreateFilledDocumentT = {
  method: "post",
  url: () => `/api/v1/sign/qtsp/clauses/filled_document`,
  headers: composeHeaderProducers(tokenHeaderProducer, ApiHeaderJson),
  query: _ => ({}),
  body: ({ body: { document_url } }) =>
    JSON.stringify({ body: { document_url } }),
  response_decoder: createFilledDocumentDefaultDecoder()
};

// client for FCI to handle API communications
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
    ),
    getQtspClausesMetadata: withBearerToken(
      createFetchRequestForApi(getQtspClausesMetadata, options)
    ),
    postQtspFilledBody: withBearerToken(
      createFetchRequestForApi(postQtspFilledBody, options)
    )
  };
};
