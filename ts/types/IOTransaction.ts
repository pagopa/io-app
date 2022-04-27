import * as t from "io-ts";
import { UTCISODateFromString } from "italia-ts-commons/lib/dates";
import { Dettaglio } from "../../definitions/pagopa/Dettaglio";
import { Amount } from "./pagopa";

// required attributes
const TransactionR = t.interface({
  created: UTCISODateFromString,

  description: t.string,

  id: t.Integer,

  idPayment: t.Integer,

  idWallet: t.Integer,

  merchant: t.string,

  statusMessage: t.string,

  grandTotal: Amount,

  amount: Amount
});

// optional attributes
const TransactionO = t.partial({
  accountingStatus: t.Integer,

  authorizationCode: t.string,

  detailsList: t.readonlyArray(Dettaglio, "array of Dettaglio"),

  directAcquirer: t.boolean,

  error: t.boolean,

  fee: Amount,

  idPsp: t.Integer,

  idStatus: t.Integer,

  nodoIdPayment: t.string,

  numAut: t.string,

  orderNumber: t.Integer,

  paymentCancelled: t.boolean,

  paymentModel: t.Integer,

  rrn: t.string,

  spcNodeDescription: t.string,

  spcNodeStatus: t.Integer,

  success: t.boolean,

  token: t.string,

  updated: UTCISODateFromString,

  urlCheckout3ds: t.string,

  urlRedirectPSP: t.string
});

export const IOTransaction = t.intersection(
  [TransactionR, TransactionO],
  "Transaction"
);

export type IOTransaction = t.TypeOf<typeof IOTransaction>;
