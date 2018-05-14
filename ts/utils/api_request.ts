/**
 * Type safe wrapper around the fetch API
 */

// TODO: add timeout to fetch (how to cancel request?)
// TODO: add etag support in responses

import * as t from "io-ts";

/**
 * Describes the possible methods of a request
 */
export type RequestMethod = "get" | "post";

/**
 * Describes the possible header keys of a request
 */
type RequestHeaderKey = "Authorization" | "Content-Type";

/**
 * Describes a set of headers whose keys are of type RequestHeaderKey
 */
export type RequestHeaders<HS extends RequestHeaderKey> = {
  [key in HS]: string
};

/**
 * Generates a set of headers with certain keys (KH) from a parameters object
 * of type P.
 */
export interface RequestHeaderProducer<P, KH extends RequestHeaderKey> {
  readonly apply: (params: P) => RequestHeaders<KH>;
}

/**
 * Composes two RequestHeaderProducer(s)
 */
export function composeHeaderProducers<
  PI,
  KI extends RequestHeaderKey,
  PH,
  KH extends RequestHeaderKey
>(
  p0: RequestHeaderProducer<PI, KI>,
  p1: RequestHeaderProducer<PH, KH>
): RequestHeaderProducer<PI & PH, KI | KH> {
  return {
    apply: params => {
      const headers0 = p0.apply(params);
      const headers1 = p1.apply(params);
      return {
        ...(headers0 as any),
        ...(headers1 as any)
      };
    }
  };
}

/**
 * Describes a possible response type: when the status code is S, the response
 * type is T.
 */
export interface ResponseType<S extends number, T> {
  status: S;
  value: T;
}

/**
 * A function that generates a typed representation of a response.
 * It should return undefined in case the response cannot be decoded (e.g.
 * in case of a parsing error).
 */
export type ResponseDecoder<R> = (response: Response) => Promise<R | undefined>;

/**
 * Composes two ResponseDecoder(s)
 */
export function composeResponseDecoders<R1, R2>(
  d0: ResponseDecoder<R1>,
  d1: ResponseDecoder<R2>
): ResponseDecoder<R1 | R2> {
  // TODO: make sure R1, R2 don't intersect
  return response => {
    const r0 = d0(response);
    return r0 !== undefined ? r0 : d1(response);
  };
}

/**
 * Fully describes an API request.
 *
 * @param M   The request method
 * @param P   The type of input parameters
 * @param H   The headers that must be defined for this request
 * @param R   The possible response types for this request
 */
export interface IBaseApiRequestType<
  M extends RequestMethod,
  P,
  H extends RequestHeaderKey,
  R
> {
  readonly method: M;
  readonly url: (params: P) => string;
  readonly headers: RequestHeaderProducer<P, H>;
  readonly response_decoder: ResponseDecoder<R>;
}

/**
 * Fully describes a GET request.
 */
export interface IGetApiRequestType<P, KH extends RequestHeaderKey, R>
  extends IBaseApiRequestType<"get", P, KH, R> {
  readonly method: "get";
}

/**
 * Fully describes a POST request.
 *
 * POST requests require to provide the "Content-Type" header.
 */
export interface IPostApiRequestType<P, KH extends RequestHeaderKey, R>
  extends IBaseApiRequestType<"post", P, KH | "Content-Type", R> {
  readonly method: "post";
  readonly body: (params: P) => string;
}

type ApiRequestType<P, KH extends RequestHeaderKey, R> =
  | IGetApiRequestType<P, KH, R>
  | IPostApiRequestType<P, KH, R>;

//
// helpers
//

/**
 * Returns an async method that implements the provided ApiRequestType backed
 * by the "fetch" API.
 */
export function createFetchRequestForApi<P, KH extends RequestHeaderKey, R>(
  requestType: ApiRequestType<P, KH, R>
): (params: P) => Promise<R | undefined> {
  // TODO: handle unsuccessful fetch and HTTP errors
  // @see https://www.pivotaltracker.com/story/show/154661120
  return async params => {
    // get the URL from the params
    const url = requestType.url(params);

    // get the headers from the params
    const headers = requestType.headers.apply(params);

    // build the request
    const requestInit: RequestInit = {
      method: requestType.method,
      headers,
      body: requestType.method === "get" ? null : requestType.body(params)
    };

    // make the async call
    const response = await fetch(url, requestInit);

    // decode the response
    return requestType.response_decoder(response);
  };
}

/**
 * An header producer that sets the Content-Type to application/json
 */
export const ApiHeaderJson: RequestHeaderProducer<{}, "Content-Type"> = {
  apply: () => ({
    "Content-Type": "application/json"
  })
};

/**
 * An io-ts based ResponseDecoder
 *
 * @param status  The response status handled by this decoder
 * @param type    The response type corresponding to the status
 */
export function ioResponseDecoder<S extends number, R>(
  status: S,
  type: t.Type<R>
): ResponseDecoder<ResponseType<S, R>> {
  return async (response: Response) => {
    const json = await response.json();
    const validated = type.decode(json);
    if (validated.isRight()) {
      return { status, value: validated.value };
    }
    return undefined;
  };
}

/**
 * A basic ResponseDecoder that returns an Error with the status text if the
 * response status is S.
 */
export function basicErrorResponseDecoder<S extends number>(
  status: S
): ResponseDecoder<ResponseType<S, Error>> {
  return async response => {
    return response.status === status
      ? { status, value: new Error(response.statusText) }
      : undefined;
  };
}

/**
 * A basic set of responses where the 200 status corresponds to a payload of
 * type R and 404 and 500 to an Error
 */
export type BasicResponseType<R> =
  | ResponseType<200, R>
  | ResponseType<404, Error>
  | ResponseType<500, Error>;

/**
 * Returns a ResponseDecoder for BasicResponseType<R>
 */
export function basicResponseDecoder<R>(
  type: t.Type<R>
): ResponseDecoder<BasicResponseType<R>> {
  return composeResponseDecoders(
    composeResponseDecoders(
      ioResponseDecoder(200, type),
      basicErrorResponseDecoder(404)
    ),
    basicErrorResponseDecoder(500)
  );
}

/**
 * A RequestHeaderProducer that produces an Authorization header of type
 * "bearer token".
 */
export class AuthorizationBearerHeaderProducer<P extends { token: string }>
  implements RequestHeaderProducer<P, "Authorization"> {
  public apply(p: P): RequestHeaders<"Authorization"> {
    return {
      Authorization: `Bearer ${p.token}`
    };
  }
}
