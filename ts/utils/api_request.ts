import * as t from "io-ts";

import { fromEither } from "fp-ts/lib/Option";

export type ApiMethod = "get" | "post";

/**
 * P = params type
 * R = response body type
 */
export interface IBaseApiCall<P, R> {
  readonly method: ApiMethod;
  readonly url: (params: P) => string;
  readonly headers: (params: P) => { [key: string]: string };
  readonly response_type: t.Type<R>;
}

export interface IGetApiCall<P, R> extends IBaseApiCall<P, R> {
  readonly method: "get";
}

export interface IPostApiCall<P, R> extends IBaseApiCall<P, R> {
  readonly method: "post";
  readonly body: (params: P) => string;
}

type ApiCallType<P, R> = IGetApiCall<P, R> | IPostApiCall<P, R>;

// TODO handle unsuccessful fetch and HTTP errors
// @see https://www.pivotaltracker.com/story/show/154661120
export function createApiCall<P, R>(
  requestType: ApiCallType<P, R>
): (params: P) => Promise<R | undefined> {
  return async params => {
    const url = requestType.url(params);
    const response = await fetch(url, {
      method: requestType.method,
      headers: requestType.headers(params),
      body: requestType.method === "get" ? null : requestType.body(params)
    });
    const payloadOrError = requestType.response_type.decode(
      await response.json()
    );
    return fromEither(payloadOrError).toUndefined();
  };
}
