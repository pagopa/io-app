import * as t from "io-ts";

import { fromEither } from "fp-ts/lib/Option";

export type ApiMethod = "get" | "post";

/**
 * P = params type
 * R = response body type
 */
export interface IBaseApiCall<
  A,
  O = A,
  I = t.mixed,
  RT extends t.Type<A, O, I> = t.Type<A, O, I>
> {
  response_body_type: RT;
  method: ApiMethod;
}

export interface IGetApiCall<R> extends IBaseApiCall<R> {
  method: "get";
}

/**
 * B = body type
 */
/*
export interface IPostApiCall<P, B, R> extends IBaseApiCall<R> {
  request_body: B;
  method: "post";
}
*/

export async function getApi<A>(req: IGetApiCall<A>): Promise<A | undefined> {
  const url = "req.url";
  const response = await fetch(url, {
    method: "get"
    // headers: { Authorization: `Bearer ${req.token}` }
  });
  const payloadOrError = req.response_body_type.decode(await response.json());
  return fromEither(payloadOrError).toUndefined();
}

/*
export async function postApi<P, B, R>(
  req: IPostApiCall<P, B, R>
): Promise<R | undefined> {
  const url = req.url;
  const response = await fetch(url, {
    method: "post",
    headers: {
      Authorization: `Bearer ${req.token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(req.request_body)
  });
  const payloadOrError = req.response_body_type.decode(await response.json());
  return fromEither(payloadOrError).toUndefined();
}
*/
