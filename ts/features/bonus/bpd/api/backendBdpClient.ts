import { Omit } from "italia-ts-commons/lib/types";
import {
  ApiHeaderJson,
  composeHeaderProducers,
  createFetchRequestForApi,
  RequestHeaderProducer
} from "italia-ts-commons/lib/requests";
import { defaultRetryingFetch } from "../../../../utils/fetch";
import {
  enrollmentDefaultDecoder,
  EnrollmentT,
  findUsingGETDefaultDecoder,
  FindUsingGETT
} from "../../../../../definitions/bpd/citizen/requestTypes";

const headersProducers = <
  P extends {
    readonly apiKeyHeader: string;
    readonly Authorization: string;
    readonly x_request_id?: string;
  }
>() =>
  ((p: P) => ({
    "Ocp-Apim-Subscription-Key": `${p.apiKeyHeader}`
  })) as RequestHeaderProducer<P, "Ocp-Apim-Subscription-Key" | "Content-Type">;

const findT: FindUsingGETT = {
  method: "get",
  url: () => `/bonus/bpd/io/citizen`,
  query: () => ({}),
  headers: headersProducers(),
  response_decoder: findUsingGETDefaultDecoder()
};

const enrollCitizenIOT: EnrollmentT = {
  method: "put",
  url: () => `/bonus/bpd/io/citizen`,
  query: () => ({}),
  body: () => "",
  headers: composeHeaderProducers(headersProducers(), ApiHeaderJson),
  response_decoder: enrollmentDefaultDecoder()
};

export function BackendBdpClient(
  baseUrl: string,
  token: string,
  fetchApi: typeof fetch = defaultRetryingFetch()
) {
  const options = {
    baseUrl,
    fetchApi
  };

  // withBearerToken injects the field 'Baerer' with value token into the parameter P
  // of the f function
  const withBearerToken = <
    P extends {
      readonly apiKeyHeader: string;
      readonly Authorization: string;
      readonly x_request_id?: string;
    },
    R
  >(
    f: (p: P) => Promise<R>
  ) => async (
    po: Omit<P, "apiKeyHeader" | "Authorization" | "x_request_id">
  ): Promise<R> => {
    const params = Object.assign({ apiKeyHeader: String(token) }, po) as P;
    return f(params);
  };

  return {
    find: withBearerToken(createFetchRequestForApi(findT, options)),
    enrollCitizenIO: withBearerToken(
      createFetchRequestForApi(enrollCitizenIOT, options)
    )
  };
}
