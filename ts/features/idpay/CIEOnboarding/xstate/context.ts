import * as O from "fp-ts/lib/Option";

export type Context = { failure: O.Option<unknown>; isCodeEnabled: boolean };
export const INITIAL_CONTEXT: Context = {
  failure: O.none,
  isCodeEnabled: false
};
