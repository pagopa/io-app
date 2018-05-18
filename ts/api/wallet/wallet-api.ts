/**
 * This file contains a list of mocked
 * data (cards and transactions), plus
 * a stub of code that is invoked throughout
 * the app to get the required data
 */
// TODO: WalletAPI is synchronous right now, it will be 
// transformed into async when needed (i.e. when the app
// will actually fetch data from the proxy/pagopa)

/* Required to build user-displayable contents (e.g. "last used ...") */
import I18n from "../../i18n";

import { Operation } from "../../types/wallet";

import { CreditCard, UNKNOWN_CARD, getCardTypeFromPAN } from "../../types/CreditCard";

interface ICardPrototype {
  id: number,
  pan: string,
  owner: string,
  expirationDate: string,
  lastUsage: string
}
function genCardFromData(data: ICardPrototype): CreditCard {
  return {
    ...data,
    type: getCardTypeFromPAN(data.pan)
  };
}
 
 
// temporarily making this a variable
// (to mock the deleteCreditCard() api more easily)
const cards: ReadonlyArray<CreditCard> = [
  {
    id: 1,
    lastUsage: `${I18n.t("wallet.lastUsage")} ${I18n.t("wallet.today")} 07:34`,
    pan: "3759 876543 02001",
    owner: "Mario Rossi",
    expirationDate: "10/20",
  },
  {
    id: 2,
    lastUsage: `${I18n.t("wallet.lastUsage")} ${I18n.t("wallet.yesterday")} 07:34`,
    pan: "4324 5201 6988 0454",
    owner: "John Doe",
    expirationDate: "11/21"
  },
  {
    id: 3,
    lastUsage: I18n.t("wallet.noNewTransactions"),
    pan: "5400 4708 6234 2849",
    owner: "Mario Bianchi",
    expirationDate: "12/22"
  },
  {
    id: 4,
    lastUsage: `${I18n.t("wallet.lastUsage")} ${I18n.t("wallet.today")} 09:12`,
    pan: "4000 1234 5678 9010",
    owner: "John Smith",
    expirationDate: "09/19"
  } 
].map(genCardFromData);

const operations: ReadonlyArray<Operation> = [
  {
    cardId: 1,
    date: "17/04/2018",
    time: "07:34",
    subject: "Certificato di residenza",
    recipient: "Comune di Gallarate",
    amount: -20.02,
    currency: "EUR",
    transactionCost: 0.5,
    isNew: true
  },
  {
    cardId: 2,
    date: "16/04/2018",
    time: "15:01",
    subject: "Spesa Supermarket",
    recipient: "Segrate",
    amount: -74.1,
    currency: "EUR",
    transactionCost: 0.5,
    isNew: true
  },
  {
    cardId: 4,
    date: "15/04/2018",
    time: "08:56",
    subject: "Prelievo contante",
    recipient: "Busto Arsizio",
    amount: -200.0,
    currency: "EUR",
    transactionCost: 0.5,
    isNew: true
  },
  {
    cardId: 2,
    date: "14/02/2018",
    time: "10:21",
    subject: "Accredito per storno",
    recipient: "Banca Sella",
    amount: 100.1,
    currency: "USD",
    transactionCost: 0.5,
    isNew: false
  },
  {
    cardId: 4,
    date: "22/01/2018",
    time: "14:54",
    subject: "Esecuzione atti notarili",
    recipient: "Comune di Legnano",
    transactionCost: 0.5,
    amount: -56.0,
    currency: "EUR",
    isNew: false
  },
  {
    cardId: 4,
    date: "01/01/2018",
    time: "23:34",
    subject: "Pizzeria Da Gennarino",
    recipient: "Busto Arsizio",
    amount: -45.0,
    currency: "EUR",
    transactionCost: 0.5,
    isNew: false
  },
  {
    cardId: 1,
    date: "22/12/2017",
    time: "14:23",
    subject: "Rimborso TARI 2012",
    recipient: "Comune di Gallarate",
    amount: 150.2,
    currency: "EUR",
    transactionCost: 0,
    isNew: false
  },
  {
    cardId: 1,
    date: "17/12/2017",
    time: "12:34",
    subject: "Ristorante I Pini",
    recipient: "Busto Arsizio",
    transactionCost: 0,
    amount: -134.0,
    currency: "EUR",
    isNew: false
  },
  {
    cardId: 4,
    date: "13/12/2017",
    time: "10:34",
    subject: "Estetista Estella",
    recipient: "Milano - via Parini 12",
    transactionCost: 0.5,
    amount: -100.0,
    currency: "EUR",
    isNew: false
  }
];

/**
 * Mocked Wallet Data
 */
export class WalletAPI {
  public static readonly MAX_OPERATIONS = 5;

  public static getCreditCards(): ReadonlyArray<CreditCard> {
    return cards;
  }

  public static getCreditCard(creditCardId: number): CreditCard {
    const card = cards.find((c: CreditCard): boolean => c.id === creditCardId);
    if (card === undefined) {
      return UNKNOWN_CARD;
    }
    return card;
  }

  public static getOperations(cardId: number): ReadonlyArray<Operation> {
    return operations.filter(
      (operation): boolean => operation.cardId === cardId
    );
  }

  public static getLatestOperations(
    maxOps: number = WalletAPI.MAX_OPERATIONS
  ): ReadonlyArray<Operation> {
    return operations.slice(0, maxOps);
  }
}
