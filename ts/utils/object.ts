import * as A from "fp-ts/Array";
import * as O from "fp-ts/Option";
import { pipe } from "fp-ts/lib/function";

export const findFirstCaseInsensitive =
  <T>(obj: { [key: string]: T }) =>
  (key: string): O.Option<[string, T]> =>
    pipe(
      obj,
      Object.entries,
      A.findFirst(([k, _]) => k.toLowerCase() === key.toLowerCase())
    );
