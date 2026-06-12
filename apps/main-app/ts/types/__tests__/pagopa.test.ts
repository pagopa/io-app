import * as E from "fp-ts/lib/Either";
import { fixWalletPspTagsValues } from "../../utils/wallet";
import {
  Amount,
  CreditCard,
  Psp,
  PspListResponse,
  Session,
  SessionResponse,
  Transaction,
  TransactionListResponse,
  TransactionResponse,
  Wallet,
  WalletListResponse,
  WalletResponse
} from "../pagopa";

const validCreditCard: { [key: string]: any } = {
  id: 1464,
  holder: "Mario Rossi",
  pan: "************0111",
  expireMonth: "05",
  expireYear: "22",
  brandLogo:
    "https://acardste.vaservices.eu:1443/static/wallet/assets/img/creditcard/generic.png",
  flag3dsVerified: true
};

// has no pan
const invalidCreditCard = Object.keys(validCreditCard)
  .filter(k => k !== "pan")
  .reduce((o, k) => ({ ...o, [k]: validCreditCard[k] }), {});

const validAmount: { [key: string]: any } = {
  currency: "EUR",
  amount: 1000,
  decimalDigits: 2
};
// has no amount
const invalidAmount = Object.keys(validAmount)
  .filter(k => k !== "amount")
  .reduce((o, k) => ({ ...o, [k]: validAmount[k] }), {});

const validPsp: { [key: string]: any } = {
  id: 43188,
  idPsp: "idPsp1",
  businessName: "WHITE bank",
  paymentType: "CP",
  idIntermediary: "idIntermediario1",
  idChannel: "idCanale14",
  logoPSP:
    "https://acardste.vaservices.eu:1443/pp-restapi/v1/resources/psp/43188",
  serviceLogo:
    "https://acardste.vaservices.eu:1443/pp-restapi/v1/resources/service/43188",
  serviceName: "nomeServizio 10 white",
  fixedCost: validAmount,
  appChannel: false,
  tags: ["MAESTRO"],
  serviceDescription: "DESCRIZIONE servizio: CP mod1",
  serviceAvailability: "DISPONIBILITA servizio 24/7",
  paymentModel: 1,
  flagStamp: true,
  idCard: 91,
  lingua: "IT"
};

// has no id
const invalidPsp = Object.keys(validPsp)
  .filter(k => k !== "id")
  .reduce((o, k) => ({ ...o, [k]: validPsp[k] }), {});

const validTransaction: { [key: string]: any } = {
  id: 2329,
  created: "2018-08-08T20:16:41Z",
  updated: "2018-08-08T20:16:41Z",
  amount: validAmount,
  grandTotal: validAmount,
  description: "pagamento fotocopie pratica",
  merchant: "Comune di Torino",
  idStatus: 3,
  statusMessage: "Confermato",
  error: false,
  success: true,
  fee: validAmount,
  token: "MjMyOQ==",
  idWallet: 2345,
  idPsp: validPsp.id,
  idPayment: 4464,
  nodoIdPayment: "eced7084-6c8e-4f03-b3ed-d556692ce090"
};

// has no id
const invalidTransaction = Object.keys(validTransaction)
  .filter(k => k !== "idWallet")
  .reduce((o, k) => ({ ...o, [k]: validTransaction[k] }), {});

const validSession: { [key: string]: any } = {
  sessionToken:
    "0r12345j8E1v2w5V1s4t1U0v5v2S6b7y4N6z01smAof3kFse3o3H9b2o4Y7a1o6I1o0r6K1b5z5G7t1m4S4p6h6n5A0r6y1U1m6Y1q9v1C8k2e0U8g12345m2n0J2c8k",
  user: {
    email: "mario@rossi.com",
    status: "REGISTERED_SPID",
    name: "Mario",
    surname: "Rossi",
    acceptTerms: true,
    username: "mario@rossi.com",
    registeredDate: "2018-08-07T16:40:54Z",
    emailVerified: true,
    cellphoneVerified: true
  }
};
const invalidSession = Object.keys(validSession)
  .filter(k => k !== "sessionToken")
  .reduce((o, k) => ({ ...o, [k]: validSession[k] }), {});

const validWallet: { [key: string]: any } = {
  idWallet: 2345,
  type: "CREDIT_CARD",
  favourite: false,
  creditCard: validCreditCard,
  psp: validPsp,
  idPsp: validPsp.id,
  pspEditable: true,
  lastUsage: "2018-08-07T15:50:08Z"
};

const validWalletNoCreditCard: { [key: string]: any } = {
  idWallet: 2345,
  type: "EXTERNAL_PS",
  favourite: false,
  psp: validPsp,
  idPsp: validPsp.id,
  pspEditable: true,
  lastUsage: "2018-08-07T15:50:08Z"
};

// has no id
const invalidWallet = Object.keys(validWallet)
  .filter(k => k !== "idWallet")
  .reduce((o, k) => ({ ...o, [k]: validWallet[k] }), {});

/**
 * mock a valid wallet with psp.tags malformed
 * TODO: temporary test. Remove this test once SIA has fixed the spec.
 * @see https://www.pivotaltracker.com/story/show/166665367
 */
const validWalletWithMalformedPspTags = {
  ...validWallet,
  psp: {
    ...validPsp,
    tags: [null, null, "VISA", "VISA", "MASTERCARD", null]
  }
};

// Amount testing
describe("Amount", () => {
  it("should recognize a valid Amount", () => {
    expect(E.isRight(Amount.decode(validAmount))).toBeTruthy();
  });
  it("should NOT recognize an invalid Amount", () => {
    expect(E.isRight(Amount.decode(invalidAmount))).toBeFalsy();
  });
});

// CreditCard testing
describe("CreditCard", () => {
  it("should recognize a valid CreditCard", () => {
    expect(E.isRight(CreditCard.decode(validCreditCard))).toBeTruthy();
  });
  it("should NOT recognize an invalid CreditCard", () => {
    expect(E.isRight(CreditCard.decode(invalidCreditCard))).toBeFalsy();
  });
});

// Psp testing
describe("Psp", () => {
  it("should recognize a valid Psp", () => {
    expect(E.isRight(Psp.decode(validPsp))).toBeTruthy();
  });
  it("should NOT recognize an invalid Psp", () => {
    expect(E.isRight(Psp.decode(invalidPsp))).toBeFalsy();
  });
});

describe("PspListResponse", () => {
  it("should recognize a valid PspListResponse", () => {
    const pspListResponse = {
      data: [validPsp, validPsp]
    };
    expect(E.isRight(PspListResponse.decode(pspListResponse))).toBeTruthy();
  });
  it("should NOT recognize an invalid PspListResponse", () => {
    const pspListResponse = {
      data: [validPsp, invalidPsp]
    };
    expect(E.isRight(PspListResponse.decode(pspListResponse))).toBeFalsy();
  });
});

// Transaction testing
describe("Transaction", () => {
  it("should accept a valid Transaction", () => {
    expect(E.isRight(Transaction.decode(validTransaction))).toBeTruthy();
  });
  it("should NOT accept an invalid Transaction", () => {
    expect(E.isRight(Transaction.decode(invalidTransaction))).toBeFalsy();
  });
});

describe("TransactionListResponse", () => {
  it("should recognize a valid TransactionListResponse", () => {
    const transactionListResponse = {
      data: [validTransaction, validTransaction],
      total: 9,
      start: 0,
      size: 10
    };
    expect(
      E.isRight(TransactionListResponse.decode(transactionListResponse))
    ).toBeTruthy();
  });
  it("should NOT recognize an invalid TransactionListResponse", () => {
    const transactionListResponse = {
      data: [validTransaction, invalidTransaction],
      total: 9,
      start: 0,
      size: 10
    };
    expect(
      E.isRight(TransactionListResponse.decode(transactionListResponse))
    ).toBeFalsy();
  });
});

describe("TransactionResponse", () => {
  it("should recognize a valid TransactionResponse", () => {
    const transactionResponse = {
      data: validTransaction
    };
    expect(
      E.isRight(TransactionResponse.decode(transactionResponse))
    ).toBeTruthy();
  });
  it("should NOT recognize an invalid TransactionResponse", () => {
    const transactionResponse = {
      data: invalidTransaction
    };
    expect(
      E.isRight(TransactionResponse.decode(transactionResponse))
    ).toBeFalsy();
  });
});

// Wallet testing
describe("Wallet", () => {
  it("should accept a valid Wallet", () => {
    expect(E.isRight(Wallet.decode(validWallet))).toBeTruthy();
  });

  it("should accept a valid Wallet that contains no credit card", () => {
    expect(E.isRight(Wallet.decode(validWalletNoCreditCard))).toBeTruthy();
  });

  it("should NOT accept an invalid Wallet", () => {
    expect(E.isRight(Wallet.decode(invalidWallet))).toBeFalsy();
  });
});

describe("WalletListResponse", () => {
  it("should recognize a valid WalletListResponse", () => {
    const walletListResponse = {
      data: [validWallet, validWallet]
    };
    expect(
      E.isRight(WalletListResponse.decode(walletListResponse))
    ).toBeTruthy();
  });

  /**
   * TODO: temporary test. Remove this test once SIA has fixed the spec.
   * @see https://www.pivotaltracker.com/story/show/166665367
   */
  it("should recognize a valid WalletListResponse also when psp tags are malformed", () => {
    const walletListResponse = {
      data: [validWalletWithMalformedPspTags, validWalletWithMalformedPspTags]
    };
    // sanitize tags field
    const walletListResponseSanitized = {
      data: walletListResponse.data.map(d => fixWalletPspTagsValues(d))
    };
    expect(
      E.isRight(WalletListResponse.decode(walletListResponseSanitized))
    ).toBeTruthy();
  });

  it("should NOT recognize an invalid WalletListResponse", () => {
    const walletListResponse = {
      data: [validWallet, invalidWallet]
    };
    expect(
      E.isRight(WalletListResponse.decode(walletListResponse))
    ).toBeFalsy();
  });
});

describe("WalletResponse", () => {
  it("should recognize a valid WalletResponse", () => {
    const walletResponse = {
      data: validWallet
    };
    expect(E.isRight(WalletResponse.decode(walletResponse))).toBeTruthy();
  });
  it("should NOT recognize an invalid WalletResponse", () => {
    const walletResponse = {
      data: invalidWallet
    };
    expect(E.isRight(WalletResponse.decode(walletResponse))).toBeFalsy();
  });
});

// Session testing
describe("Session", () => {
  it("should recognize a valid Session", () => {
    expect(E.isRight(Session.decode(validSession))).toBeTruthy();
  });
  it("should NOT recognize an invalid Session", () => {
    expect(E.isRight(Session.decode(invalidSession))).toBeFalsy();
  });
});

describe("SessionResponse", () => {
  it("should recognize a valid SessionResponse", () => {
    const sessionResponse = {
      data: validSession
    };
    expect(E.isRight(SessionResponse.decode(sessionResponse))).toBeTruthy();
  });
  it("should NOT recognize an invalid Session", () => {
    const sessionResponse = {
      data: invalidSession
    };
    expect(E.isRight(SessionResponse.decode(sessionResponse))).toBeFalsy();
  });
});
