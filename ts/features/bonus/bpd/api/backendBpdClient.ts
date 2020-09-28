import {
  ApiHeaderJson,
  composeHeaderProducers,
  createFetchRequestForApi,
  RequestHeaderProducer
} from "italia-ts-commons/lib/requests";
import * as t from "io-ts";
import * as r from "italia-ts-commons/lib/requests";
import { defaultRetryingFetch } from "../../../../utils/fetch";
import {
  enrollmentDefaultDecoder,
  EnrollmentT,
  findUsingGETDefaultDecoder,
  FindUsingGETT
} from "../../../../../definitions/bpd/citizen/requestTypes";
import { Iban } from "../../../../../definitions/backend/Iban";

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

export function patchIbanDecoders<A, O>(type: t.Type<A, O>) {
  return r.composeResponseDecoders(
    r.composeResponseDecoders(
      r.composeResponseDecoders(
        r.ioResponseDecoder<200, typeof type["_A"], typeof type["_O"]>(
          200,
          type
        ),
        r.composeResponseDecoders(
          r.constantResponseDecoder<undefined, 400>(400, undefined),
          r.constantResponseDecoder<undefined, 401>(401, undefined)
        )
      ),
      r.constantResponseDecoder<undefined, 404>(404, undefined)
    ),
    r.constantResponseDecoder<undefined, 500>(500, undefined)
  );
}

/* Patch IBAN */
const PatchIban = t.interface({ validationStatus: t.string });
type PatchIban = t.TypeOf<typeof PatchIban>;
type finalType =
  | r.IResponseType<200, PatchIban>
  | r.IResponseType<401, undefined>
  | r.IResponseType<404, undefined>
  | r.IResponseType<400, undefined>
  | r.IResponseType<500, undefined>;
const updatePaymentMethodT = (
  options: Options,
  iban: { payoffInstr: Iban; payoffInstrType: string },
  headers: Record<string, string>
): (() => Promise<t.Validation<finalType>>) => () =>
  new Promise((res, rej) => {
    options
      .fetchApi(`${options.baseUrl}/bonus/bpd/io/citizen`, {
        method: "patch",
        headers,
        body: JSON.stringify(iban)
      })
      .then(response => {
        patchIbanDecoders(PatchIban)(response).then(res).catch(rej);
      })
      .catch(rej);
  });

type Options = {
  baseUrl: string;
  fetchApi: typeof fetch;
};

export function BackendBpdClient(
  baseUrl: string,
  token: string,
  fetchApi: typeof fetch = defaultRetryingFetch()
) {
  const options: Options = {
    baseUrl,
    fetchApi
  };

  // withBearerToken injects the field 'Bearer' with value token into the parameter P
  // of the f function
  type extendHeaders = {
    readonly apiKeyHeader?: string;
    readonly Authorization?: string;
    readonly Bearer?: string;
    ["Ocp-Apim-Subscription-Key"]?: string;
  };
  const withBearerToken = <P extends extendHeaders, R>(
    f: (p: P) => Promise<R>
  ) => async (po: P): Promise<R> => {
    const params = Object.assign(buildHeaders(token), po) as P;
    return f(params);
  };

  const buildHeaders = (token: string, content_type?: string) => {
    const headers = {
      "Ocp-Apim-Subscription-Key": "dummy_key",
      Bearer: token
    };
    return content_type
      ? { ...headers, ["Content-Type"]: content_type }
      : headers;
  };

  return {
    find: withBearerToken(createFetchRequestForApi(findT, options)),
    enrollCitizenIO: withBearerToken(
      createFetchRequestForApi(enrollCitizenIOT, options)
    ),
    updatePaymentMethod: (iban: Iban) =>
      updatePaymentMethodT(
        options,
        { payoffInstr: iban, payoffInstrType: "IBAN" },
        buildHeaders(token, "application/json; charset=utf-8")
      )
  };
}
