import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { Locales } from "../../../../../locales/locales";

export const preferredLanguageToString = (
  preferredLanguageMaybe: O.Option<Locales>
) =>
  pipe(
    preferredLanguageMaybe,
    O.getOrElseW(() => "it")
  );
