/**
 * This file contains a list of mocked
 * data (cards and transactions), plus
 * a stub of code that is invoked throughout
 * the app to get the required data
 */

// Required to build user-displayable contents (e.g. "last used ...")
import { NonEmptyString } from "italia-ts-commons/lib/strings";
import I18n from "../../i18n";
import { CreditCard } from "../../types/CreditCard";
import { TransactionManager, WalletTransaction } from "../../types/wallet";
import { NotifiedTransaction, TransactionSummary } from "../../types/wallet";
import { TransactionEntity, TransactionSubject } from "../../types/wallet";

// temporarily making this a variable
// (to mock the deleteCreditCard() api more easily)
/**
 * Mocked wallet data
 */
const managers: ReadonlyArray<TransactionManager> = [
  {
    id: 1,
    maxFee: 1.3,
    icon: require("../../../img/wallet/Managers/Poste_Italiane1x.png")
  },
  {
    id: 2,
    maxFee: 1.0,
    icon: require("../../../img/wallet/Managers/Unicredit1x.png")
  },
  {
    id: 2,
    maxFee: 0.5,
    icon: require("../../../img/wallet/Managers/Nexi1x.png")
  }
];

const cards: ReadonlyArray<CreditCard> = [
  {
    id: 1,
    lastUsage: `${I18n.t("wallet.lastUsage")} ${I18n.t(
      "wallet.today"
    )} 07:34` as NonEmptyString,
    pan: "375987654302001",
    owner: "Mario Rossi" as NonEmptyString,
    expirationDate: "10/20" as NonEmptyString
  },
  {
    id: 2,
    lastUsage: `${I18n.t("wallet.lastUsage")} ${I18n.t(
      "wallet.yesterday"
    )} 07:34` as NonEmptyString,
    pan: "4324520169880454",
    owner: "John Doe" as NonEmptyString,
    expirationDate: "11/21" as NonEmptyString
  },
  {
    id: 3,
    lastUsage: I18n.t("wallet.noNewTransactions") as NonEmptyString,
    pan: "5400470862342849",
    owner: "Mario Bianchi" as NonEmptyString,
    expirationDate: "12/22" as NonEmptyString
  },
  {
    id: 4,
    lastUsage: `${I18n.t("wallet.lastUsage")} ${I18n.t(
      "wallet.today"
    )} 09:12` as NonEmptyString,
    pan: "4000123456789010",
    owner: "John Smith" as NonEmptyString,
    expirationDate: "09/19" as NonEmptyString
  }
];

const transactions: ReadonlyArray<WalletTransaction> = [
  {
    id: 1,
    cardId: 1,
    date: "17/04/2018",
    time: "07:34",
    isoDatetime: "2018-04-17T07:34:00.000Z",
    paymentReason: "Certificato di residenza",
    recipient: "Comune di Gallarate",
    amount: 20.02,
    currency: "EUR",
    transactionCost: 0.5,
    isNew: true
  },
  {
    id: 2,
    cardId: 2,
    date: "16/04/2018",
    time: "15:01",
    isoDatetime: "2018-04-16T15:01:00.000Z",
    paymentReason: "Spesa Supermarket",
    recipient: "Segrate",
    amount: 74.1,
    currency: "EUR",
    transactionCost: 0.5,
    isNew: true
  },
  {
    id: 3,
    cardId: 4,
    date: "15/04/2018",
    time: "08:56",
    isoDatetime: "2018-04-15T08:56:00.000Z",
    paymentReason: "Prelievo contante",
    recipient: "Busto Arsizio",
    amount: -200.0,
    currency: "EUR",
    transactionCost: 0.5,
    isNew: true
  },
  {
    id: 4,
    cardId: 2,
    date: "14/02/2018",
    time: "10:21",
    isoDatetime: "2018-02-14T10:21:00.000Z",
    paymentReason: "Accredito per storno",
    recipient: "Banca Sella",
    amount: 100.1,
    currency: "USD",
    transactionCost: 0.5,
    isNew: true
  },
  {
    id: 5,
    cardId: 4,
    date: "22/01/2018",
    time: "14:54",
    isoDatetime: "2018-01-22T14:54:00.000Z",
    paymentReason: "Esecuzione atti notarili",
    recipient: "Comune di Legnano",
    transactionCost: 0.5,
    amount: 56.0,
    currency: "EUR",
    isNew: true
  },
  {
    id: 6,
    cardId: 4,
    date: "01/01/2018",
    time: "23:34",
    isoDatetime: "2018-01-01T23:34:00.000Z",
    paymentReason: "Pizzeria Da Gennarino",
    recipient: "Busto Arsizio",
    amount: 45.0,
    currency: "EUR",
    transactionCost: 0.5,
    isNew: true
  },
  {
    id: 7,
    cardId: 1,
    date: "22/12/2017",
    time: "14:23",
    isoDatetime: "2017-12-22T14:23:00.000Z",
    paymentReason: "Rimborso TARI 2012",
    recipient: "Comune di Gallarate",
    amount: 150.2,
    currency: "EUR",
    transactionCost: 0,
    isNew: true
  },
  {
    id: 8,
    cardId: 1,
    date: "17/12/2017",
    time: "12:34",
    isoDatetime: "2017-12-17T12:34:00.000Z",
    paymentReason: "Ristorante I Pini",
    recipient: "Busto Arsizio",
    transactionCost: 0,
    amount: 134.0,
    currency: "EUR",
    isNew: true
  },
  {
    id: 9,
    cardId: 4,
    date: "13/12/2017",
    time: "10:34",
    isoDatetime: "2017-12-13T10:34:00.000Z",
    paymentReason: "Estetista Estella",
    recipient: "Milano - via Parini 12",
    transactionCost: 0.5,
    amount: 100.0,
    currency: "EUR",
    isNew: true
  }
];

const transactionSummary: Readonly<TransactionSummary> = {
  currentAmount: 199.0,
  fee: 1.5,
  totalAmount: 200.5,
  paymentReason: "Tari 2018",
  entityName: "Comune di Gallarate"
};

const notifiedTransaction: Readonly<NotifiedTransaction> = {
  noticeCode: "112324875636161",
  notifiedAmount: 199.0,
  currentAmount: 215.0,
  expireDate: new Date("03/01/2018"),
  tranche: "unica",
  paymentReason: "Tari 2018",
  cbill: "A0EDT",
  iuv: "111116000001580"
};

const transactionEntity: Readonly<TransactionEntity> = {
  code: "01199250158",
  name: "Comune di Gallarate - Settore Tributi",
  address: "Via Cavour n.2 - Palazzo Broletto,21013",
  city: "Gallarate (VA)",
  tel: "0331.754224",
  webpage: "www.comune.gallarate.va.it",
  email: "tributi@coumne.gallarate.va.it",
  pec: "protocollo@pec.comune.gallarate.va.it"
};

const transactionSubject: Readonly<TransactionSubject> = {
  name: "Mario Rossi",
  address: "Via Murillo 8, 20149 Milano (MI)"
};

/**
 * Mocked Wallet API
 */
// TODO: WalletAPI is synchronous right now, it will be
// transformed into async when needed (i.e. when the app
// will actually fetch data from the proxy/pagopa)
// @https://www.pivotaltracker.com/story/show/157770129
export class WalletAPI {
  public static async getCreditCards(): Promise<ReadonlyArray<CreditCard>> {
    return cards;
  }

  public static async getTransactions(): Promise<
    ReadonlyArray<WalletTransaction>
  > {
    return transactions;
  }

  public static getTransaction(id: number): Readonly<WalletTransaction> {
    return transactions[id];
  }

  public static getManagers(): ReadonlyArray<TransactionManager> {
    return managers;
  }

  public static getTransactionSummary(): Readonly<TransactionSummary> {
    return transactionSummary;
  }

  public static getNotifiedTransaction(): Readonly<NotifiedTransaction> {
    return notifiedTransaction;
  }

  public static getTransactionEntity(): Readonly<TransactionEntity> {
    return transactionEntity;
  }

  public static getTransactionSubject(): Readonly<TransactionSubject> {
    return transactionSubject;
  }

  public static getCreditCard(index: number): Readonly<CreditCard> {
    return cards[index];
  }
}
