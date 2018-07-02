import { NonEmptyString } from "italia-ts-commons/lib/strings";
import { ApiFetchResult } from ".";
import { Amount } from "../../definitions/pagopa/Amount";
import { CreditCard as PagoPACreditCard } from "../../definitions/pagopa/CreditCard";
import { Transaction as PagoPATransaction } from "../../definitions/pagopa/Transaction";
import { Wallet } from "../../definitions/pagopa/Wallet";
import { pagoPaApiUrlPrefix } from "../config";
import I18n from "../i18n";
import {
  CreditCard,
  CreditCardId,
  CreditCardType,
  UNKNOWN_CARD
} from "../types/CreditCard";
import { UNKNOWN_TRANSACTION, WalletTransaction } from "../types/wallet";

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
    pWallet.lastUsage === undefined ||
    pWallet.idWallet === undefined ||
    pCard.pan === undefined ||
    pCard.holder === undefined ||
    pCard.expireMonth === undefined ||
    pCard.expireYear === undefined ||
    pCard.brandLogo === undefined ||
    CreditCardType.decode(pCard.brandLogo).isLeft()
  ) {
    return UNKNOWN_CARD;
  }
  return {
    id: pWallet.idWallet as CreditCardId, // tslint:disable-line no-useless-cast
    lastUsage: `${I18n.t("wallet.lastUsage")} ${new Date(
      pWallet.lastUsage
    ).toLocaleDateString()}` as NonEmptyString,
    pan: pCard.pan,
    holder: pCard.holder as NonEmptyString, // tslint:disable-line no-useless-cast
    expirationDate: `${pCard.expireMonth}/${
      pCard.expireYear
    }` as NonEmptyString,
    brandLogo: CreditCardType.decode(pCard.brandLogo).value as CreditCardType // tslint:disable-line no-useless-cast
  };
};

const mapToLocalTransaction = (
  pTransaction: PagoPATransaction
): WalletTransaction => {
  const amount = Amount.decode(pTransaction.amount).getOrElse({
    amount: undefined
  });
  const fee = Amount.decode(pTransaction.fee).getOrElse({ amount: undefined });
  const currency = amount.currency
    ? amount.currency
    : fee.currency
      ? fee.currency
      : undefined;
  if (
    pTransaction.id === undefined ||
    pTransaction.idWallet === undefined ||
    pTransaction.created === undefined ||
    pTransaction.description === undefined ||
    amount.amount === undefined ||
    fee.amount === undefined ||
    currency === undefined ||
    pTransaction.merchant === undefined
  ) {
    return UNKNOWN_TRANSACTION;
  }
  return {
    id: pTransaction.id,
    cardId: pTransaction.idWallet as CreditCardId, // tslint:disable-line no-useless-cast
    datetime: pTransaction.created,
    paymentReason: pTransaction.description,
    recipient: pTransaction.merchant,
    amount:
      amount.amount /
      Math.pow(10, amount.decimalDigits ? amount.decimalDigits : 2),
    currency,
    fee: fee.amount / Math.pow(10, fee.decimalDigits ? fee.decimalDigits : 2),
    isNew: false // TODO: handled "new" transactions
  };
};

/**
 * fetches a list of credit cards from PagoPA
 * and returns it (after converting
 * it Wallet -> CreditCard)
 * @param token the token to be passed to the server
 */
export const fetchCreditCards = async (
  token: string
): Promise<ApiFetchResult<ReadonlyArray<CreditCard>>> => {
  try {
    const response = await fetch(`${pagoPaApiUrlPrefix}/v1/wallet`, {
      method: "get",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    if (response.ok) {
      const wallet: { data: ReadonlyArray<any> } = await response.json();
      const cards = wallet.data
        .map(w => Wallet.decode(w))
        .filter(w => w.isRight())
        .map(w => mapToLocalCreditCard(w.value));
      return {
        isError: false,
        result: cards
      };
    } else {
      return {
        isError: true,
        error: Error(
          `The credit cards fetching operation failed with error ${
            response.status
          }`
        )
      };
    }
  } catch (error) {
    return {
      isError: true,
      error
    };
  }
};

/**
 * Fetches a list of transactions from the
 * PagoPA server and returns it (after converting
 * Transaction -> WalletTransaction )
 * @param token the token to be passed to the server
 */
export const fetchTransactions = async (
  token: string
): Promise<ApiFetchResult<ReadonlyArray<WalletTransaction>>> => {
  try {
    const response = await fetch(`${pagoPaApiUrlPrefix}/v1/transactions`, {
      method: "get",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    if (response.ok) {
      const transactions: { data: ReadonlyArray<any> } = await response.json();
      const localTransactions = transactions.data
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
        error: Error(
          `The transactions fetching operation failed with error ${
            response.status
          }`
        )
      };
    }
  } catch (error) {
    return {
      isError: true,
      error
    };
  }
};
