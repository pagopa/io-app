import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { formatNumberAmount } from "../../../../utils/stringBuilder";

export const formatNumberCurrency = (amount: number) =>
  `${formatNumberAmount(amount, false)} €`;

export const formatNumberCurrencyOrDefault = (
  input: number | undefined,
  defaultValue: string = "-"
) =>
  pipe(
    input,
    O.fromNullable,
    O.map(formatNumberCurrency),
    O.getOrElse(() => defaultValue)
  );
