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
import { RTron } from "../../../../boot/configureStoreAndPersistor";

const headersProducers = <
  P extends {
    readonly apiKeyHeader: string;
  }
>() =>
  ((p: P) => ({
    // since these headers are not correctly autogenerate we have to access them as an anon object
    "Ocp-Apim-Subscription-Key": `${(p as any)["Ocp-Apim-Subscription-Key"]}`,
    Authorization: `Bearer ${(p as any).Bearer}`
  })) as RequestHeaderProducer<
    P,
    "Ocp-Apim-Subscription-Key" | "Content-Type" | "Authorization"
  >;

const findT: FindUsingGETT = {
  method: "get",
  url: () => `/bonus/bpd/io/citizen`,
  query: _ => ({}),
  headers: headersProducers(),
  response_decoder: findUsingGETDefaultDecoder()
};

const enrollCitizenIOT: EnrollmentT = {
  method: "put",
  url: () => `/bonus/bpd/io/citizen`,
  query: _ => ({}),
  body: _ => "",
  headers: composeHeaderProducers(headersProducers(), ApiHeaderJson),
  response_decoder: enrollmentDefaultDecoder()
};

type ApiNewtorkResult<T, S> = {
  value: T;
  status: S;
};

const doIban = (url: string, fetchApi: typeof fetch) => {
  return new Promise<void>((res, rej) => {
    fetchApi(`${url}/bonus/bpd/io/citizen`, { method: "patch" })
      .then(response => {
        RTron.log(response.status);
      })
      .catch(rej);
  });
};

export function BackendBpdClient(
  baseUrl: string,
  token: string,
  fetchApi: typeof fetch = defaultRetryingFetch()
) {
  const options = {
    baseUrl,
    fetchApi
  };

  // withBearerToken injects the field 'Bearer' with value token into the parameter P
  // of the f function
  type extendHeaders = {
    readonly apiKeyHeader: string;
    readonly Authorization: string;
    readonly Bearer: string;
    ["Ocp-Apim-Subscription-Key"]: string;
  };
  const withBearerToken = <P extends extendHeaders, R>(
    f: (p: P) => Promise<R>
  ) => async (
    po: Omit<P, "Bearer" | "Ocp-Apim-Subscription-Key">
  ): Promise<R> => {
    const params = Object.assign(
      {
        "Ocp-Apim-Subscription-Key": "dummy_key",
        Bearer: token
      },
      po
    ) as P;
    return f(params);
  };
  doIban(baseUrl, fetchApi).then().catch();

  return {
    find: withBearerToken(createFetchRequestForApi(findT, options)),
    enrollCitizenIO: withBearerToken(
      createFetchRequestForApi(enrollCitizenIOT, options)
    ),
    updatePaymentMethod: ""
  };
}
