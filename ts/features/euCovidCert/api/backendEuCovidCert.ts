import {
  ApiHeaderJson,
  composeHeaderProducers,
  createFetchRequestForApi
} from "@pagopa/ts-commons/lib/requests";
import {
  getCertificateDefaultDecoder,
  GetCertificateT
} from "../../../../definitions/eu_covid_cert/requestTypes";
import { SessionToken } from "../../../types/SessionToken";
import {
  tokenHeaderProducer,
  withBearerToken as withToken
} from "../../../utils/api";
import { defaultRetryingFetch } from "../../../utils/fetch";

const getCertificate: GetCertificateT = {
  method: "post",
  url: () => "/api/v1/eucovidcert/certificate",
  headers: composeHeaderProducers(tokenHeaderProducer, ApiHeaderJson),
  query: _ => ({}),
  body: p => JSON.stringify({ accessData: p.accessData }),
  response_decoder: getCertificateDefaultDecoder()
};

// client for eu covid to handle API communications
export const BackendEuCovidCertClient = (
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
    getCertificate: withBearerToken(
      createFetchRequestForApi(getCertificate, options)
    )
  };
};
