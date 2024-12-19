import { WithinRangeInteger } from "@pagopa/ts-commons/lib/numbers";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";

export const normalizedDiscountPercentage = (discount?: number) =>
  pipe(
    WithinRangeInteger(1, 100).decode(discount),
    E.map(v => v.toString()),
    E.getOrElse(() => "-")
  );

export const isValidDiscount = (discount?: number) =>
  pipe(WithinRangeInteger(1, 100).decode(discount), E.isRight);
