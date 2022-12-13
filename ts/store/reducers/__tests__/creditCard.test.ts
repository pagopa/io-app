import * as AR from "fp-ts/lib/Array";
import sha from "sha.js";
import * as O from "fp-ts/lib/Option";
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
  addWalletCreditCardFailure,
  addWalletCreditCardRequest,
  addWalletCreditCardSuccess,
  addWalletNewCreditCardSuccess,
  creditCardPaymentNavigationUrls
} from "../../actions/wallet/wallets";
import { Action } from "../../actions/types";
import { addCreditCardOutcomeCode } from "../../actions/wallet/outcomeCode";

const creditCardToAdd: NullableWallet = {
  creditCard: {
    pan: "abcd1234" as CreditCardPan,
    expireMonth: "12" as CreditCardExpirationMonth,
    expireYear: "23" as CreditCardExpirationYear,
    securityCode: undefined,
    holder: "holder"
  }
} as NullableWallet;

const anotherCreditCardToAdd: NullableWallet = {
  creditCard: {
    pan: "qwerty6789" as CreditCardPan,
    expireMonth: "11" as CreditCardExpirationMonth,
    expireYear: "22" as CreditCardExpirationYear,
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

const aGenericError = { kind: "GENERIC_ERROR" as const, reason: "a reason" };

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
    const finalState = AR.range(
      1,
      MAX_HISTORY_LENGTH + 10
    ).reduce<CreditCardInsertionState>(
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
    const [creditCardInfo] = runReducer([], addCCAction);
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
    expect(creditCardInfo.onboardingComplete).toBe(false);
  });

  it("should add a credit card attempt and the relative wallet info (2nd step)", () => {
    const [cardItem] = runReducer(
      [],
      addCCAction,
      addWalletCreditCardSuccess(walletResponse)
    );
    const walletInfo = cardItem.wallet;
    expect(walletInfo).toBeDefined();
    if (walletInfo) {
      expect(walletInfo.idWallet).toEqual(walletResponse.data.idWallet);
      expect(walletInfo.brand).toEqual(walletResponse.data.creditCard!.brand);
      expect(walletInfo.idCreditCard).toEqual(
        walletResponse.data.creditCard!.id
      );
    }
    expect(cardItem.onboardingComplete).toBe(false);
  });

  it("should set wallet on last inserted item", () => {
    const state = runReducer(
      [],
      addCCAction,
      addWalletCreditCardRequest({
        creditcard: anotherCreditCardToAdd
      }),
      addWalletCreditCardSuccess(walletResponse)
    );

    const [anotherCardItem, cardItem] = state;
    expect(anotherCardItem.wallet).toBeDefined();
    expect(cardItem.wallet).not.toBeDefined();
    expect(cardItem.onboardingComplete).toBe(false);
  });

  it("should add a credit card in the history and the relative failure reason in case of failure", () => {
    const state = runReducer(
      [],
      addCCAction,
      addWalletCreditCardFailure(aGenericError)
    );

    const [cardItem] = state;

    expect(cardItem.failureReason).toEqual(aGenericError);
    expect(cardItem.onboardingComplete).toBe(false);
  });

  it("should set failure on last inserted item", () => {
    const state = runReducer(
      [],
      addCCAction,
      addWalletCreditCardRequest({
        creditcard: anotherCreditCardToAdd
      }),
      addWalletCreditCardFailure(aGenericError)
    );

    const [anotherCardItem, cardItem] = state;
    expect(anotherCardItem.failureReason).toEqual(aGenericError);
    expect(cardItem.failureReason).not.toBeDefined();
    expect(cardItem.onboardingComplete).toBe(false);
  });

  it("should remove failure on new request for the same card", () => {
    const state = runReducer(
      [],
      addCCAction,
      addWalletCreditCardFailure(aGenericError),
      addCCAction
    );

    const [cardItem] = state;
    expect(state.length).toBe(1);
    expect(cardItem.failureReason).not.toBeDefined();
    expect(cardItem.onboardingComplete).toBe(false);
  });

  it("should add the history of 3ds urls to a card item", () => {
    const state = runReducer(
      [],
      addCCAction,
      addWalletCreditCardSuccess(walletResponse)
    );

    const [cardItem] = state;

    expect(cardItem.wallet).toBeDefined();
    expect(cardItem.onboardingComplete).toBe(false);
  });

  it("should add a failure message when the verification payment fails", () => {
    const state = runReducer(
      [],
      addCCAction,
      addWalletCreditCardSuccess(walletResponse)
    );

    const [cardItem] = state;

    expect(cardItem.failureReason).not.toBeDefined();
    expect(cardItem.onboardingComplete).toBe(false);
  });

  it("should add transaction data when the verification payment succeeded", () => {
    const state = runReducer(
      [],
      addCCAction,
      addWalletCreditCardSuccess(walletResponse)
    );

    const [cardItem] = state;
    expect(cardItem.onboardingComplete).toBe(false);
  });

  it("should mark an item as completed when credit card finish to onboard", () => {
    const state = runReducer(
      [],
      addCCAction,
      addWalletCreditCardSuccess(walletResponse),
      addWalletNewCreditCardSuccess()
    );

    const [cardItem] = state;

    expect(cardItem.onboardingComplete).toBe(true);
  });

  it("should save the outcome code", () => {
    const outComeCode = "123";
    const state = runReducer(
      [],
      addCCAction,
      addCreditCardOutcomeCode(O.some(outComeCode))
    );
    const [cardItem] = state;
    expect(cardItem.outcomeCode).toEqual(outComeCode);
  });

  it("should save the navigation urls", () => {
    const urls = ["url1", "url2", "url3", "url4"];
    const state = runReducer(
      [],
      addCCAction,
      creditCardPaymentNavigationUrls(urls)
    );
    const [cardItem] = state;
    expect(cardItem.payNavigationUrls).toEqual(urls);
  });
});

const runReducer = (
  initialState: CreditCardInsertionState,
  ...actions: Array<Action>
): CreditCardInsertionState => actions.reduce(reducer, initialState);
