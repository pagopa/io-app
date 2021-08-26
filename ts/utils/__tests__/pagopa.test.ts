import { isSuccessTransaction, Transaction } from "../../types/pagopa";

const transaction: Transaction = {
  accountingStatus: 1,
  amount: { amount: 20000 },
  created: new Date(2018, 10, 30, 13, 12, 22, 30),
  description: `test`,
  error: false,
  fee: { amount: 1 },
  grandTotal: { amount: 32100 },
  id: 1,
  idPayment: 1,
  idPsp: 43188,
  idStatus: 3,
  idWallet: 12345,
  merchant: "merchant",
  nodoIdPayment: "nodoIdPayment",
  paymentModel: 5,
  spcNodeDescription: "spcNodeDescription",
  spcNodeStatus: 6,
  statusMessage: "statusMessage",
  success: true,
  token: "token",
  updated: undefined,
  urlCheckout3ds: "urlCheckout3ds",
  urlRedirectPSP: "urlRedirectPSP"
};

describe("cisSuccessTransaction", () => {
  it("should return true", () => {
    expect(
      isSuccessTransaction({ ...transaction, accountingStatus: 1 })
    ).toBeTruthy();
  });

  it("should return false", () => {
    expect(
      isSuccessTransaction({
        ...transaction,
        accountingStatus: undefined,
        idStatus: undefined
      })
    ).toBeFalsy();
  });

  it("should return false", () => {
    expect(
      isSuccessTransaction({ ...transaction, accountingStatus: 2, idStatus: 8 })
    ).toBeFalsy();
  });

  it("should return true", () => {
    expect(
      isSuccessTransaction({
        ...transaction,
        accountingStatus: undefined,
        idStatus: 8
      })
    ).toBeTruthy();
    expect(
      isSuccessTransaction({
        ...transaction,
        accountingStatus: undefined,
        idStatus: 9
      })
    ).toBeTruthy();
  });
});
