import { PaymentNoticeNumberFromString } from "@pagopa/io-pagopa-commons/lib/pagopa";
import {
  NonEmptyString,
  OrganizationFiscalCode
} from "@pagopa/ts-commons/lib/strings";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";

export const decodePaymentNoticeNumber = (
  value?: string
): O.Option<PaymentNoticeNumberFromString> =>
  pipe(
    O.fromNullable(value),
    O.filter(NonEmptyString.is),
    O.map(_ => _.replace(/\s/g, "")),
    O.map(PaymentNoticeNumberFromString.decode),
    O.chain(O.fromEither)
  );

export const validatePaymentNoticeNumber = (value?: string): boolean =>
  O.isSome(decodePaymentNoticeNumber(value));

export const decodeOrganizationFiscalCode = (
  value?: string
): O.Option<OrganizationFiscalCode> =>
  pipe(
    O.fromNullable(value),
    O.filter(NonEmptyString.is),
    O.map(_ => _.replace(/\s/g, "")),
    O.map(OrganizationFiscalCode.decode),
    O.chain(O.fromEither)
  );

export const validateOrganizationFiscalCode = (value?: string): boolean =>
  O.isSome(decodeOrganizationFiscalCode(value));
