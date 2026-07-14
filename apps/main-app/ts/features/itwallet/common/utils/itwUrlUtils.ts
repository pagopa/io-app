import { pipe } from "fp-ts/function";
import * as O from "fp-ts/Option";

export const getUrlParam = (url: string, paramName: string): O.Option<string> =>
  pipe(
    O.tryCatch(() => new URL(url)),
    O.chainNullableK(({ searchParams }) => searchParams.get(paramName))
  );
