import * as t from "io-ts";

interface IDPayTransactionCodeBrand {
  readonly IDPayTransactionCode: unique symbol;
}

const transactionCodePattern = /^[0-9]{8}$/;
export const IDPayTransactionCode = t.brand(
  t.string,
  (s: string): s is t.Branded<string, IDPayTransactionCodeBrand> =>
    transactionCodePattern.test(s),
  "IDPayTransactionCode"
);

export type IDPayTransactionCode = t.TypeOf<typeof IDPayTransactionCode>;
