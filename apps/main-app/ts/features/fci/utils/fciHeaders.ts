import * as t from "io-ts";

/**
 * FCI headers
 * This is the type of the headers returned by the FCI API
 * due to resolve wrong type error in the auto-generated client
 */
export const FciHeaders = t.type({
  map: t.type({
    "x-io-sign-environment": t.string
  })
});

export type FciHeaders = t.TypeOf<typeof FciHeaders>;
