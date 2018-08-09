import {
  Transaction,
  TransactionListResponse,
  TransactionResponse,
  WalletListResponse,
  WalletResponse,
  Wallet,
  Psp,
  PspListResponse,
  Amount,
  CreditCard
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

// has no id
const invalidWallet = Object.keys(validWallet)
  .filter(k => k !== "idWallet")
  .reduce((o, k) => ({ ...o, [k]: validWallet[k] }), {});

// Amount testing
describe("Amount", () => {
  it("should recognize a valid Amount", () => {
    expect(Amount.decode(validAmount).isRight()).toBeTruthy();
  });
  it("should NOT recognize an invalid Amount", () => {
    expect(Amount.decode(invalidAmount).isRight()).toBeFalsy();
  });
});

// CreditCard testing
describe("CreditCard", () => {
  it("should recognize a valid CreditCard", () => {
    expect(CreditCard.decode(validCreditCard).isRight()).toBeTruthy();
  });
  it("should NOT recognize an invalid CreditCard", () => {
    expect(CreditCard.decode(invalidCreditCard).isRight()).toBeFalsy();
  });
});

// Psp testing
describe("Psp", () => {
  it("should recognize a valid Psp", () => {
    expect(Psp.decode(validPsp).isRight()).toBeTruthy();
  });
  it("should NOT recognize an invalid Psp", () => {
    expect(Psp.decode(invalidPsp).isRight()).toBeFalsy();
  });
});

describe("PspListResponse", () => {
  it("should recognize a valid PspListResponse", () => {
    const pspListResponse = {
      data: [validPsp, validPsp]
    };
    expect(PspListResponse.decode(pspListResponse).isRight()).toBeTruthy();
  });
  it("should NOT recognize an invalid PspListResponse", () => {
    const pspListResponse = {
      data: [validPsp, invalidPsp]
    };
    expect(PspListResponse.decode(pspListResponse).isRight()).toBeFalsy();
  });
});

// Transaction testing
describe("Transaction", () => {
  it("should accept a valid Transaction", () => {
    expect(Transaction.decode(validTransaction).isRight()).toBeTruthy();
  });
  it("should NOT accept an invalid Transaction", () => {
    expect(Transaction.decode(invalidTransaction).isRight()).toBeFalsy();
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
      TransactionListResponse.decode(transactionListResponse).isRight()
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
      TransactionListResponse.decode(transactionListResponse).isRight()
    ).toBeFalsy();
  });
});

describe("TransactionResponse", () => {
  it("should recognize a valid TransactionResponse", () => {
    const transactionResponse = {
      data: validTransaction
    };
    expect(
      TransactionResponse.decode(transactionResponse).isRight()
    ).toBeTruthy();
  });
  it("should NOT recognize an invalid TransactionResponse", () => {
    const transactionResponse = {
      data: invalidTransaction
    };
    expect(
      TransactionResponse.decode(transactionResponse).isRight()
    ).toBeFalsy();
  });
});

// Wallet testing
describe("Wallet", () => {
  it("should accept a valid Wallet", () => {
    expect(Wallet.decode(validWallet).isRight()).toBeTruthy();
  });
  it("should NOT accept an invalid Wallet", () => {
    expect(Wallet.decode(invalidWallet).isRight()).toBeFalsy();
  });
});

describe("WalletListResponse", () => {
  it("should recognize a valid WalletListResponse", () => {
    const walletListResponse = {
      data: [validWallet, validWallet]
    };
    expect(
      WalletListResponse.decode(walletListResponse).isRight()
    ).toBeTruthy();
  });
  it("should NOT recognize an invalid WalletListResponse", () => {
    const walletListResponse = {
      data: [validWallet, invalidWallet]
    };
    expect(WalletListResponse.decode(walletListResponse).isRight()).toBeFalsy();
  });
});

describe("WalletResponse", () => {
  it("should recognize a valid WalletResponse", () => {
    const walletResponse = {
      data: validWallet
    };
    expect(WalletResponse.decode(walletResponse).isRight()).toBeTruthy();
  });
  it("should NOT recognize an invalid WalletResponse", () => {
    const walletResponse = {
      data: invalidWallet
    };
    expect(WalletResponse.decode(walletResponse).isRight()).toBeFalsy();
  });
});
