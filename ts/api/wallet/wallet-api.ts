/**
 * This file contains a list of mocked
 * data (cards and transactions), plus
 * a stub of code that is invoked throughout
 * the app to get the required data
 */

import { Transaction } from "../../../definitions/pagopa/Transaction";
import { Wallet } from "../../../definitions/pagopa/Wallet";
import { TransactionManager } from "../../types/wallet";

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

const wallets: ReadonlyArray<Wallet> = [
  {
    creditCard: {
      brandLogo: "AMEX",
      expireMonth: "10",
      expireYear: "20",
      flag3dsVerified: false,
      holder: "Mario Rossi",
      id: -1,
      pan: "2001"
    },
    favourite: false,
    idPsp: 4,
    idWallet: 1,
    lastUsage: new Date("2018-07-16T07:34:00.000Z"),
    psp: {
      businessName: "Poste Italiane",
      fixedCost: {
        amount: 50,
        currency: "EUR",
        decimalDigits: 2
      }
    }
  },
  {
    creditCard: {
      brandLogo: "VISA",
      expireMonth: "11",
      expireYear: "21",
      flag3dsVerified: false,
      holder: "John Doe",
      id: -1,
      pan: "4545"
    },
    favourite: false,
    idPsp: 3,
    idWallet: 2,
    lastUsage: new Date("2018-02-14T10:21:00.000Z"),
    psp: {
      businessName: "Visa",
      fixedCost: {
        amount: 150,
        currency: "EUR",
        decimalDigits: 2
      }
    }
  },
  {
    creditCard: {
      brandLogo: "MASTERCARD",
      expireMonth: "12",
      expireYear: "22",
      flag3dsVerified: false,
      holder: "Mario Bianchi",
      id: -1,
      pan: "2849"
    },
    favourite: false,
    idPsp: 2,
    idWallet: 3,
    lastUsage: new Date("-"),
    psp: {
      businessName: "Mastercard",
      fixedCost: {
        amount: 200,
        currency: "EUR",
        decimalDigits: 2
      }
    }
  },
  {
    creditCard: {
      brandLogo: "VISA",
      expireMonth: "09",
      expireYear: "19",
      flag3dsVerified: false,
      holder: "John Smith",
      id: -1,
      pan: "9010"
    },
    favourite: false,
    idPsp: 3,
    idWallet: 4,
    lastUsage: new Date("2018-01-22T14:54:00.000Z"),
    psp: {
      businessName: "Visa",
      fixedCost: {
        amount: 125,
        currency: "EUR",
        decimalDigits: 2
      }
    }
  }
];

const transactions: ReadonlyArray<Transaction> = [
  {
    id: 1,
    amount: {
      amount: 2002,
      currency: "EUR",
      currencyNumber: "1",
      decimalDigits: 2
    },
    created: new Date("2018-04-17T07:34:00.000Z"),
    description: "Certificato di residenza",
    error: false,
    fee: { amount: 50, currency: "EUR", currencyNumber: "1", decimalDigits: 2 },
    grandTotal: {
      amount: 2052,
      currency: "EUR",
      currencyNumber: "1",
      decimalDigits: 2
    },
    idPayment: 1,
    idPsp: 1,
    idStatus: 1,
    idWallet: 1,
    merchant: "Comune di Gallarate",
    nodoIdPayment: "1",
    paymentModel: 1,
    statusMessage: "OK",
    success: true,
    token: "42",
    updated: new Date("2018-04-17T07:34:00.000Z"),
    urlCheckout3ds: "",
    urlRedirectPSP: ""
  },
  {
    id: 2,
    amount: {
      amount: 7410,
      currency: "EUR",
      currencyNumber: "1",
      decimalDigits: 2
    },
    created: new Date("2018-04-16T15:01:00.000Z"),
    description: "Spesa Supermarket",
    error: false,
    fee: { amount: 50, currency: "EUR", currencyNumber: "1", decimalDigits: 2 },
    grandTotal: {
      amount: 7460,
      currency: "EUR",
      currencyNumber: "1",
      decimalDigits: 2
    },
    idPayment: 2,
    idPsp: 1,
    idStatus: 1,
    idWallet: 2,
    merchant: "Segrate",
    nodoIdPayment: "1",
    paymentModel: 1,
    statusMessage: "OK",
    success: true,
    token: "42",
    updated: new Date("2018-04-16T15:01:00.000Z"),
    urlCheckout3ds: "",
    urlRedirectPSP: ""
  },
  {
    id: 3,
    amount: {
      amount: -20000,
      currency: "EUR",
      currencyNumber: "1",
      decimalDigits: 2
    },
    created: new Date("2018-04-15T08:56:00.000Z"),
    description: "Prelievo contante",
    error: false,
    fee: { amount: 50, currency: "EUR", currencyNumber: "1", decimalDigits: 2 },
    grandTotal: {
      amount: -19950,
      currency: "EUR",
      currencyNumber: "1",
      decimalDigits: 2
    },
    idPayment: 3,
    idPsp: 1,
    idStatus: 1,
    idWallet: 4,
    merchant: "Busto Arsizio",
    nodoIdPayment: "1",
    paymentModel: 1,
    statusMessage: "OK",
    success: true,
    token: "42",
    updated: new Date("2018-04-15T08:56:00.000Z"),
    urlCheckout3ds: "",
    urlRedirectPSP: ""
  },
  {
    id: 4,
    amount: {
      amount: 10010,
      currency: "EUR",
      currencyNumber: "1",
      decimalDigits: 2
    },
    created: new Date("2018-02-14T10:21:00.000Z"),
    description: "Accredito per storno",
    error: false,
    fee: { amount: 50, currency: "EUR", currencyNumber: "1", decimalDigits: 2 },
    grandTotal: {
      amount: 10060,
      currency: "EUR",
      currencyNumber: "1",
      decimalDigits: 2
    },
    idPayment: 4,
    idPsp: 1,
    idStatus: 1,
    idWallet: 2,
    merchant: "Banca Sella",
    nodoIdPayment: "1",
    paymentModel: 1,
    statusMessage: "OK",
    success: true,
    token: "42",
    updated: new Date("2018-02-14T10:21:00.000Z"),
    urlCheckout3ds: "",
    urlRedirectPSP: ""
  },
  {
    id: 5,
    amount: {
      amount: 5600,
      currency: "EUR",
      currencyNumber: "1",
      decimalDigits: 2
    },
    created: new Date("2018-01-22T14:54:00.000Z"),
    description: "Esecuzione atti notarili",
    error: false,
    fee: { amount: 50, currency: "EUR", currencyNumber: "1", decimalDigits: 2 },
    grandTotal: {
      amount: 5650,
      currency: "EUR",
      currencyNumber: "1",
      decimalDigits: 2
    },
    idPayment: 5,
    idPsp: 1,
    idStatus: 1,
    idWallet: 4,
    merchant: "Comune di Legnano",
    nodoIdPayment: "1",
    paymentModel: 1,
    statusMessage: "OK",
    success: true,
    token: "42",
    updated: new Date("2018-01-22T14:54:00.000Z"),
    urlCheckout3ds: "",
    urlRedirectPSP: ""
  },
  {
    id: 6,
    amount: {
      amount: 4500,
      currency: "EUR",
      currencyNumber: "1",
      decimalDigits: 2
    },
    created: new Date("2018-01-01T23:34:00.000Z"),
    description: "Pizzeria Da Gennarino",
    error: false,
    fee: { amount: 50, currency: "EUR", currencyNumber: "1", decimalDigits: 2 },
    grandTotal: {
      amount: 4550,
      currency: "EUR",
      currencyNumber: "1",
      decimalDigits: 2
    },
    idPayment: 6,
    idPsp: 1,
    idStatus: 1,
    idWallet: 4,
    merchant: "Busto Arsizio",
    nodoIdPayment: "1",
    paymentModel: 1,
    statusMessage: "OK",
    success: true,
    token: "42",
    updated: new Date("2018-01-01T23:34:00.000Z"),
    urlCheckout3ds: "",
    urlRedirectPSP: ""
  },
  {
    id: 7,
    amount: {
      amount: 15020,
      currency: "EUR",
      currencyNumber: "1",
      decimalDigits: 2
    },
    created: new Date("2017-12-22T14:23:00.000Z"),
    description: "Rimborso TARI 2012",
    error: false,
    fee: { amount: 0, currency: "EUR", currencyNumber: "1", decimalDigits: 2 },
    grandTotal: {
      amount: 15020,
      currency: "EUR",
      currencyNumber: "1",
      decimalDigits: 2
    },
    idPayment: 7,
    idPsp: 1,
    idStatus: 1,
    idWallet: 1,
    merchant: "Comune di Gallarate",
    nodoIdPayment: "1",
    paymentModel: 1,
    statusMessage: "OK",
    success: true,
    token: "42",
    updated: new Date("2017-12-22T14:23:00.000Z"),
    urlCheckout3ds: "",
    urlRedirectPSP: ""
  },
  {
    id: 8,
    amount: {
      amount: 13400,
      currency: "EUR",
      currencyNumber: "1",
      decimalDigits: 2
    },
    created: new Date("2017-12-17T12:34:00.000Z"),
    description: "Ristorante I Pini",
    error: false,
    fee: { amount: 0, currency: "EUR", currencyNumber: "1", decimalDigits: 2 },
    grandTotal: {
      amount: 13400,
      currency: "EUR",
      currencyNumber: "1",
      decimalDigits: 2
    },
    idPayment: 8,
    idPsp: 1,
    idStatus: 1,
    idWallet: 1,
    merchant: "Busto Arsizio",
    nodoIdPayment: "1",
    paymentModel: 1,
    statusMessage: "OK",
    success: true,
    token: "42",
    updated: new Date("2017-12-17T12:34:00.000Z"),
    urlCheckout3ds: "",
    urlRedirectPSP: ""
  },
  {
    id: 9,
    amount: {
      amount: 10000,
      currency: "EUR",
      currencyNumber: "1",
      decimalDigits: 2
    },
    created: new Date("2017-12-13T10:34:00.000Z"),
    description: "Estetista Estella",
    error: false,
    fee: { amount: 50, currency: "EUR", currencyNumber: "1", decimalDigits: 2 },
    grandTotal: {
      amount: 10050,
      currency: "EUR",
      currencyNumber: "1",
      decimalDigits: 2
    },
    idPayment: 9,
    idPsp: 1,
    idStatus: 1,
    idWallet: 4,
    merchant: "Milano - via Parini 12",
    nodoIdPayment: "1",
    paymentModel: 1,
    statusMessage: "OK",
    success: true,
    token: "42",
    updated: new Date("2017-12-13T10:34:00.000Z"),
    urlCheckout3ds: "",
    urlRedirectPSP: ""
  }
];

/**
 * Mocked Wallet API
 */
// TODO: WalletAPI is synchronous right now, it will be
// transformed into async when needed (i.e. when the app
// will actually fetch data from the proxy/pagopa)
// @https://www.pivotaltracker.com/story/show/157770129
export class WalletAPI {
  public static async getWallets(): Promise<ReadonlyArray<Wallet>> {
    return wallets;
  }

  public static async getTransactions(): Promise<ReadonlyArray<Transaction>> {
    return transactions;
  }

  public static getTransaction(id: number): Readonly<Transaction> {
    return transactions[id];
  }

  public static getManagers(): ReadonlyArray<TransactionManager> {
    return managers;
  }
}
