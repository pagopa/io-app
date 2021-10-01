import { Omit } from "italia-ts-commons/lib/types";
import {
  RequestHeaderProducer,
  RequestHeaders
} from "italia-ts-commons/lib/requests";

// withBearerToken injects the field 'Bearer' with value token into the parameter P
// of the f function
export const withBearerToken =
  (token: string) =>
  <P extends { Bearer: string }, R>(f: (p: P) => Promise<R>) =>
  async (po: Omit<P, "Bearer">): Promise<R> => {
    const params = Object.assign({ Bearer: String(token) }, po) as P;
    return f(params);
  };

function ParamAuthorizationBearerHeaderProducer<
  P extends { readonly Bearer: string }
>(): RequestHeaderProducer<P, "Authorization"> {
  return (p: P): RequestHeaders<"Authorization"> => ({
    Authorization: `Bearer ${p.Bearer}`
  });
}

export const tokenHeaderProducer = ParamAuthorizationBearerHeaderProducer();
