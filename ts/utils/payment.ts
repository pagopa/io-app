import { AmountInEuroCents, RptId } from "@pagopa/io-pagopa-commons/lib/pagopa";
import { ITuple2, Tuple2 } from "@pagopa/ts-commons/lib/tuples";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import I18n from "i18next";
import { Detail_v2Enum } from "../../definitions/backend/PaymentProblemJson";
import { maybeNotNullyString } from "./strings";

/**
 * Decode a Data Matrix string from Poste returning
 * a tuple with an `RptId` and an `AmountInEuroCents`
 * or none.
 */
export function decodePosteDataMatrix(
  data: string
): O.Option<ITuple2<RptId, AmountInEuroCents>> {
  if (!data.startsWith("codfase=NBPA;")) {
    return O.none;
  }

  const paymentNoticeNumber = data.slice(15, 33);
  const organizationFiscalCode = data.slice(66, 77);
  const amount = data.slice(49, 59);

  const decodedRpdId = pipe(
    {
      organizationFiscalCode,
      paymentNoticeNumber
    },
    RptId.decode,
    O.fromEither
  );

  const decodedAmount = pipe(amount, AmountInEuroCents.decode, O.fromEither);

  if (O.isNone(decodedRpdId) || O.isNone(decodedAmount)) {
    return O.none;
  }

  return O.some(Tuple2(decodedRpdId.value, decodedAmount.value));
}

/**
 * This tags are defined in PagoPA specs for transaction description.
 * @see https://pagopa-codici.readthedocs.io/it/latest/_docs/Capitolo3.html
 */
const prefixes: ReadonlyArray<string> = ["RFA", "RFB", "RFS"];

const hasDescriptionPrefix = (description: string) =>
  prefixes.some(
    p => description.startsWith(`${p}/`) || description.startsWith(`/${p}/`)
  );

/**
 * This function removes the tag from payment description of a PagoPA transaction.
 */
export const cleanTransactionDescription = (description: string): string => {
  const descriptionParts = description.split("TXT/");

  return descriptionParts.length > 1
    ? descriptionParts[descriptionParts.length - 1].trim()
    : pipe(
        getTransactionIUV(description), // try to extract codice avviso from description
        O.chain(maybeNotNullyString),
        O.map(ca => `${I18n.t("payment.IUV")} ${ca}`),
        O.getOrElse(() => description)
      );
};

export type ErrorTypes =
  | "REVOKED"
  | "EXPIRED"
  | "ONGOING"
  | "DUPLICATED"
  | "NOT_FOUND"
  | "UNCOVERED";

export type DetailV2Keys = keyof typeof Detail_v2Enum;

/**
 * This function is used to convert the raw error code to the main error type.
 * Main error types is represented by the union type ErrorTypes.
 * @param error
 */
export const getV2ErrorMainType = (
  error?: DetailV2Keys
): ErrorTypes | undefined => {
  if (error === undefined) {
    return undefined;
  }

  switch (error) {
    case "PAA_PAGAMENTO_IN_CORSO":
    case "PPT_PAGAMENTO_IN_CORSO":
      return "ONGOING";
    case "PAA_PAGAMENTO_ANNULLATO":
      return "REVOKED";
    case "PAA_PAGAMENTO_SCADUTO":
      return "EXPIRED";
    case "PAA_PAGAMENTO_DUPLICATO":
    case "PPT_PAGAMENTO_DUPLICATO":
      return "DUPLICATED";
    case "PAA_PAGAMENTO_SCONOSCIUTO":
      return "NOT_FOUND";
    default:
      return "UNCOVERED";
  }
};

// try to extract IUV from transaction description
// see https://github.com/pagopa/pagopa-codici-docs/blob/master/_docs/Capitolo3.rst#3-formato-della-causale-di-versamento
export const getTransactionIUV = (
  transactionDescription: string
): O.Option<string> => {
  const description = transactionDescription.trim();
  if (!hasDescriptionPrefix(description)) {
    return O.none;
  }
  const splitted = description.split("/").filter(i => i.trim().length > 0);
  return splitted.length > 1 ? O.some(splitted[1]) : O.none;
};

export const isPaidPaymentFromDetailV2Enum = (details: Detail_v2Enum) =>
  details === Detail_v2Enum.PAA_PAGAMENTO_DUPLICATO ||
  details === Detail_v2Enum.PPT_PAGAMENTO_DUPLICATO;
export const isRevokedPaymentFromDetailV2Enum = (details: Detail_v2Enum) =>
  details === Detail_v2Enum.PAA_PAGAMENTO_ANNULLATO;
export const isExpiredPaymentFromDetailV2Enum = (details: Detail_v2Enum) =>
  details === Detail_v2Enum.PAA_PAGAMENTO_SCADUTO;
export const isOngoingPaymentFromDetailV2Enum = (details: Detail_v2Enum) =>
  details === Detail_v2Enum.PAA_PAGAMENTO_IN_CORSO ||
  details === Detail_v2Enum.PPT_PAGAMENTO_IN_CORSO;
