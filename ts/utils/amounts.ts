import * as t from "io-ts";
import {
  AmountInEuroCents,
  AmountInEuroCentsFromNumber
} from "italia-ts-commons/lib/pagopa";
import { ImportoEuroCents } from "../../definitions/backend/ImportoEuroCents";

export const AmountToImporto = new t.Type<
  ImportoEuroCents,
  AmountInEuroCents,
  AmountInEuroCents
>(
  "ImportoToAmount",
  ImportoEuroCents.is,
  (a, c) =>
    ImportoEuroCents.validate(AmountInEuroCentsFromNumber.encode(a) * 100, c),
  i => `${i}` as AmountInEuroCents
);

export const amountToImportoWithFallback = (
  a: AmountInEuroCents
): ImportoEuroCents =>
  AmountToImporto.decode(a).getOrElse(99999999 as ImportoEuroCents);
