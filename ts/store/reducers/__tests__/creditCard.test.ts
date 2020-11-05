import { range } from "fp-ts/lib/Array";
import sha from "sha.js";
import { NullableWallet, WalletResponse } from "../../../types/pagopa";
import {
  CreditCardExpirationMonth,
  CreditCardExpirationYear,
  CreditCardPan
} from "../../../utils/input";
import reducer, {
  CreditCardInsertionState,
  MAX_HISTORY_LENGTH
} from "../wallet/creditCard";

import {
  addWalletCreditCardRequest,
  addWalletCreditCardSuccess
} from "../../actions/wallet/wallets";
import { Action } from "../../actions/types";

const creditCardToAdd: NullableWallet = {
  creditCard: {
    pan: "abcd1234" as CreditCardPan,
    expireMonth: "12" as CreditCardExpirationMonth,
    expireYear: "23" as CreditCardExpirationYear,
    securityCode: undefined,
    holder: "holder"
  }
} as NullableWallet;

const walletResponse: WalletResponse = {
  data: {
    idWallet: 123,
    creditCard: {
      id: 456,
      expireMonth: "01" as CreditCardExpirationMonth,
      expireYear: "12" as CreditCardExpirationYear,
      brand: "brand"
    }
  }
} as WalletResponse;

const addCCAction = addWalletCreditCardRequest({
  creditcard: creditCardToAdd
});

// eslint-disable-next-line functional/no-let
let salt = "X";
const getNewCreditCard = () => {
  salt += "X";
  return {
    creditcard: {
      ...creditCardToAdd,
      creditCard: {
        ...creditCardToAdd.creditCard!,
        pan: ((creditCardToAdd.creditCard!.pan as string) +
          salt) as CreditCardPan
      }
    }
  };
};
describe("credit card history", () => {
  it("should add a credit card attempt into the history", () => {
    const state1 = runReducer([], addCCAction);
    expect(state1.length).toEqual(1);

    const addCCAction2 = addWalletCreditCardRequest(getNewCreditCard());
    const state2 = runReducer(state1, addCCAction2);
    expect(state2.length).toEqual(2);
  });

  it("should limit the stored attempts to a maximum", () => {
    const finalState = range(1, MAX_HISTORY_LENGTH + 10).reduce<
      CreditCardInsertionState
    >(
      acc => runReducer(acc, addWalletCreditCardRequest(getNewCreditCard())),
      []
    );
    expect(finalState.length).toBeLessThanOrEqual(MAX_HISTORY_LENGTH);
  });

  it("should not add a credit card attempt (already present)", () => {
    const state1 = runReducer([], addCCAction);
    expect(state1.length).toEqual(1);
    const state2 = runReducer(state1, addCCAction);
    expect(state2.length).toEqual(1);
  });

  it("should store the credit card attempts info", () => {
    const state1 = runReducer([], addCCAction);
    const creditCardInfo = state1[0];
    expect(creditCardInfo.blurredPan).toEqual("1234");
    expect(creditCardInfo.hashedPan).toEqual(
      sha("sha256").update(creditCardToAdd.creditCard!.pan).digest("hex")
    );
    expect(creditCardInfo.expireMonth).toEqual(
      creditCardToAdd.creditCard!.expireMonth
    );
    expect(creditCardInfo.expireYear).toEqual(
      creditCardToAdd.creditCard!.expireYear
    );
  });

  it("should add a credit card attempt and the relative wallet info (2nd step)", () => {
    const state1 = runReducer([], addCCAction);
    const state2 = runReducer(
      state1,
      addWalletCreditCardSuccess(walletResponse)
    );
    const walletInfo = state2[0].wallet;
    expect(walletInfo).toBeDefined();
    if (walletInfo) {
      expect(walletInfo.idWallet).toEqual(walletResponse.data.idWallet);
      expect(walletInfo.brand).toEqual(walletResponse.data.creditCard!.brand);
      expect(walletInfo.idCreditCard).toEqual(
        walletResponse.data.creditCard!.id
      );
    }
  });
});

const runReducer = (
  state: CreditCardInsertionState,
  action: Action
): CreditCardInsertionState => reducer(state, action);
