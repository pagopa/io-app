/**
 * Type safe wrapper around the fetch API
 */

// TODO: add timeout to fetch (how to cancel request?)
// TODO: add etag support in responses

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
 * It should return undefined in case of error (e.g. parsing).
 */
export type ResponseDecoder<R> = (
  response: Response
) => Promise<Required<R> | undefined>;

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
