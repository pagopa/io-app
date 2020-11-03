import { NullableWallet } from "../../../types/pagopa";
import {
  CreditCardExpirationMonth,
  CreditCardExpirationYear,
  CreditCardPan
} from "../../../utils/input";
import reducer, { CreditCardHistoryState } from "../wallet/creditCard";

import { addWalletCreditCardRequest } from "../../actions/wallet/wallets";
import { Action } from "../../actions/types";

const creditCardToAdd: NullableWallet = {
  creditCard: {
    pan: "abc" as CreditCardPan,
    expireMonth: "12" as CreditCardExpirationMonth,
    expireYear: "23" as CreditCardExpirationYear,
    securityCode: undefined,
    holder: "holder"
  }
} as NullableWallet;

describe("credit card history", () => {
  const addCCAction = addWalletCreditCardRequest({
    creditcard: creditCardToAdd
  });

  it("should add a credit card in the history", () => {
    const state1 = doAddCreditCardTest([], addCCAction);
    expect(state1.length).toEqual(1);
  });

  it("should not add a credit card in the history (already present)", () => {
    const state1 = doAddCreditCardTest([], addCCAction);
    expect(state1.length).toEqual(1);
    const state2 = doAddCreditCardTest(state1, addCCAction);
    expect(state2.length).toEqual(1);
  });
});

const doAddCreditCardTest = (
  state: CreditCardHistoryState,
  action: Action
): CreditCardHistoryState => reducer(state, action);
