import * as O from "fp-ts/lib/Option";

export type Context = {
  initiativeId: O.Option<string>;
  initiativeName?: string;
};

export const INITIAL_CONTEXT: Context = {
  initiativeId: O.none
};
