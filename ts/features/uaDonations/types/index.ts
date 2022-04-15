import * as t from "io-ts";
import { OrganizationFiscalCode } from "@pagopa/ts-commons/lib/strings";
import { PaymentNoticeNumberFromString } from "@pagopa/io-pagopa-commons/lib/pagopa";

export const WebUrlMessage = t.interface({
  kind: t.literal("webUrl"),
  payload: t.string
});

export const PaymentMessage = t.interface({
  kind: t.literal("payment"),
  payload: t.interface({
    nav: PaymentNoticeNumberFromString,
    cf: OrganizationFiscalCode,
    amount: t.number
  })
});

export const ErrorMessage = t.interface({
  kind: t.literal("error"),
  payload: t.string
});

export const UADonationWebViewMessage = t.taggedUnion("kind", [
  WebUrlMessage,
  PaymentMessage,
  ErrorMessage
]);

export type UADonationWebViewMessage = t.TypeOf<
  typeof UADonationWebViewMessage
>;
