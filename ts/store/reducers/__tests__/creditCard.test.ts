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
  addWalletCreditCardFailure,
  addWalletCreditCardRequest,
  addWalletCreditCardSuccess,
  creditCardCheckout3dsRedirectionUrls
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

const aUrlArray =  ["url1", "url2"] as ReadonlyArray<string>;

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
    const [lastItem] = state2;
    const walletInfo = lastItem.wallet;
    expect(walletInfo).toBeDefined();
    if (walletInfo) {
      expect(walletInfo.idWallet).toEqual(walletResponse.data.idWallet);
      expect(walletInfo.brand).toEqual(walletResponse.data.creditCard!.brand);
      expect(walletInfo.idCreditCard).toEqual(
        walletResponse.data.creditCard!.id
      );
    }
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
  });

  it("should add a credit card in the history and the relative failure reason in case of failure", () => {

    const state = runReducer(
      [],
      addCCAction,
      addWalletCreditCardFailure("GENERIC_ERROR")
    );
   
    const [lastItem] = state;

    expect(lastItem.failureReason).toBe("GENERIC_ERROR");
  });

  it("should set failure on last inserted item", () => {
    const state = runReducer(
      [],
      addCCAction,
      addWalletCreditCardRequest({
        creditcard: anotherCreditCardToAdd
      }),
      addWalletCreditCardFailure("GENERIC_ERROR")
    );

    const [anotherCardItem, cardItem] = state;
    expect(anotherCardItem.failureReason).toBe("GENERIC_ERROR");
    expect(cardItem.failureReason).not.toBeDefined();

  });

  it("should remove failure on new request for the same card", () => {
    const state = runReducer(
      [],
      addCCAction,
      addWalletCreditCardFailure("GENERIC_ERROR"),
      addCCAction
    );

    const [ cardItem ] = state;
    expect(state.length).toBe(1);
    expect(cardItem.failureReason).not.toBeDefined();
  });


  it("should add the history of 3ds urls to a card item", () => {
    const state = runReducer(
      [],
      addCCAction,
      addWalletCreditCardSuccess(walletResponse),
      creditCardCheckout3dsRedirectionUrls(aUrlArray),
    );

    const [ cardItem ] = state;
    
    expect(cardItem.wallet).toBeDefined();
    expect(cardItem.urlHistory3ds).toEqual(aUrlArray);
  });
});

const runReducer = (
  initialState: CreditCardInsertionState,
  ...actions: Array<Action>
): CreditCardInsertionState => actions.reduce((s, a) => reducer(s, a), initialState);
