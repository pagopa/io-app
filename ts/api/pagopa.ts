import { ApiFetchResult } from ".";
import { pagoPaApiUrlPrefix } from "../config";
import { Wallet } from "../../definitions/pagopa/Wallet";
import { CreditCard as PagoPACreditCard } from "../../definitions/pagopa/CreditCard";
import {
  Transaction as PagoPATransaction,
  Entity
} from "../../definitions/pagopa/Transaction";
import { CreditCard, UNKNOWN_CARD, CreditCardType } from "../types/CreditCard";
import { NonEmptyString } from "italia-ts-commons/lib/strings";
import I18n from "../i18n";
import { WalletTransaction, UNKNOWN_TRANSACTION } from "../types/wallet";
import { Amount } from "../../definitions/pagopa/Amount";

/**
 * This function converts a Wallet object into
 * a displayable CreditCard one
 * @param pWallet Wallet received from the PagoPA API
 */
const mapToLocalCreditCard = (pWallet: Wallet): CreditCard => {
  if (!pWallet.creditCard) {
    return UNKNOWN_CARD;
  }
  const pCard: PagoPACreditCard = pWallet.creditCard;
  if (
    !pWallet.lastUsage ||
    !pWallet.id ||
    !pCard.pan ||
    !pCard.holder ||
    !pCard.expireMonth ||
    !pCard.expireYear ||
    !pCard.brandLogo ||
    CreditCardType.decode(pCard.brandLogo).isLeft()
  ) {
    return UNKNOWN_CARD;
  }
  return {
    id: pWallet.id, // TODO: idWallet on the original API -- but being this the wallet itself, `id` is a better naming convention
    lastUsage: `${I18n.t("wallet.lastUsage")} ${new Date(
      pWallet.lastUsage
    ).toLocaleDateString()}` as NonEmptyString,
    pan: pCard.pan as NonEmptyString,
    holder: pCard.holder as NonEmptyString,
    expirationDate: `${pCard.expireMonth}/${
      pCard.expireYear
    }` as NonEmptyString,
    brandLogo: CreditCardType.decode(pCard.brandLogo).value as CreditCardType
  };
};

export const fetchCreditCards = async (
  token: string
): Promise<ApiFetchResult<ReadonlyArray<CreditCard>>> => {
  const response = await fetch(
    `${pagoPaApiUrlPrefix}/v1/app-users/me/wallets?access_token=${token}`,
    { method: "get" }
  );
  if (response.ok) {
    const wallet: ReadonlyArray<any> = await response.json();
    const cards = wallet
      .map(w => Wallet.decode(w))
      .filter(w => w.isRight())
      .map(w => mapToLocalCreditCard(w.value as Wallet)); // w has already passed the "isRight" test
    return {
      isError: false,
      result: cards
    };
  } else {
    return {
      isError: true,
      error: new Error(
        `The credit cards fetching operation failed with error ${
          response.status
        }`
      )
    };
  }
};

export type WalletTransaction = {
  id: number;
  cardId: number;
  isoDatetime: string;
  date: string;
  time: string;
  paymentReason: string;
  recipient: string;
  amount: number;
  currency: string;
  transactionCost: number;
  isNew: boolean;
};

const mapToLocalTransaction = (
  pTransaction: PagoPATransaction
): WalletTransaction => {
  const amount = Amount.decode(pTransaction.amount).getOrElse({
    amount: undefined
  });
  const fee = Amount.decode(pTransaction.fee).getOrElse({ amount: undefined });
  const entityName = Entity.decode(pTransaction.entity).getOrElse({
    name: undefined
  }).name;
  const currency = amount.currency
    ? amount.currency
    : fee.currency
      ? fee.currency
      : undefined;
  if (
    !pTransaction.id ||
    !pTransaction.walletId ||
    !pTransaction.created ||
    !pTransaction.description ||
    !amount.amount ||
    !fee.amount ||
    !currency ||
    !entityName
  ) {
    return UNKNOWN_TRANSACTION;
  }
  return {
    id: pTransaction.id,
    cardId: pTransaction.walletId, // idWallet accoring to SIA
    datetime: pTransaction.created,
    paymentReason: pTransaction.description,
    recipient: entityName,
    amount:
      amount.amount /
      Math.pow(10, amount.decimalDigits ? amount.decimalDigits : 2),
    currency,
    fee: fee.amount / Math.pow(10, fee.decimalDigits ? fee.decimalDigits : 2),
    isNew: false // TODO: handled "new" transactions
  };
};

export const fetchTransactionsByCreditCard = async (
  token: string,
  walletId: number
): Promise<ApiFetchResult<ReadonlyArray<WalletTransaction>>> => {
  const response = await fetch(
    `${pagoPaApiUrlPrefix}/v1/wallets/${walletId}/transactions?access_token=${token}`,
    { method: "get" }
  );
  if (response.ok) {
    const transactions: ReadonlyArray<any> = await response.json();
    const localTransactions = transactions
      .map(t => PagoPATransaction.decode(t))
      .filter(t => t.isRight())
      .map((t): WalletTransaction => mapToLocalTransaction(t.value));
    return {
      isError: false,
      result: localTransactions
    };
  } else {
    return {
      isError: true,
      error: new Error(
        `The credit cards fetching operation failed with error ${
          response.status
        }`
      )
    };
  }
};
