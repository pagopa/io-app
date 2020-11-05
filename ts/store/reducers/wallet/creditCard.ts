import { getType } from "typesafe-actions";
import sha from "sha.js";
import { fromNullable } from "fp-ts/lib/Option";
import { index, take, takeEnd } from "fp-ts/lib/Array";
import {
  addWalletCreditCardRequest,
  addWalletCreditCardSuccess
} from "../../actions/wallet/wallets";
import { Action } from "../../actions/types";

type CreditCardInsertion = {
  startDate: Date;
  hashedPan: string; // hashed PAN
  blurredPan: string; // anonymized PAN
  expireMonth: string;
  expireYear: string;
  wallet?: {
    idWallet: number;
    idCreditCard?: number;
    brand?: string;
  };
};

export type CreditCardInsertionState = ReadonlyArray<CreditCardInsertion>;
export const MAX_HISTORY_LENGTH = 15;

const trimState = (state: CreditCardInsertionState) =>
  take(MAX_HISTORY_LENGTH, [...state]);

/**
 * card insertion follow these step:
 * 1. request to add a credit card: addWalletCreditCardRequest
 * 2. adding result: addWalletCreditCardSuccess or addWalletCreditCardFailure
 * 3. if 2 is addWalletCreditCardSuccess -> creditCardCheckout3dsRequest
 * 4. creditCardCheckout3dsSuccess
 * 5. addWalletNewCreditCardSuccess completed onboarded (add + pay + checkout)
 * see: https://docs.google.com/presentation/d/1nikV9vNGCFE_9Mxt31ZQuqzQXeJucMW3kdJvtjoBtC4/edit#slide=id.ga4eb40050a_0_4
 *
 * step 1 adds an item into the history.
 * all further steps add their info referring the item in the 0-index position
 * that is the one added in the step 1
 */
const reducer = (
  state: CreditCardInsertionState = [],
  action: Action
): CreditCardInsertionState => {
  switch (action.type) {
    case getType(addWalletCreditCardRequest):
      const payload = action.payload;
      const cc = fromNullable(payload.creditcard?.creditCard);
      return cc.fold<CreditCardInsertionState>(state, c => {
        const hashedPan = sha("sha256").update(c.pan).digest("hex");
        // ensure to have only a single item representing the card insertion
        const newState = state.filter(c => c.hashedPan !== hashedPan);
        const creditCardAttempt: CreditCardInsertion = {
          startDate: new Date(),
          hashedPan,
          blurredPan: c.pan.slice(-4),
          expireMonth: c.expireMonth,
          expireYear: c.expireYear
        };
        return trimState([creditCardAttempt, ...newState]);
      });
    case getType(addWalletCreditCardSuccess):
      const currentState = [...state];
      const wallet = action.payload.data;
      const maybeAttempt = index<CreditCardInsertion>(0, currentState);
      return maybeAttempt.fold(state, attempt => {
        const updatedAttempt = {
          ...attempt,
          wallet: {
            idWallet: wallet.idWallet,
            idCreditCard: wallet.creditCard?.id,
            brand: wallet.creditCard?.brand
          }
        };
        const updateState =
          state.length === 0
            ? [updatedAttempt]
            : // place the update item at 0-index position
              // tailed by the others element 1...N
              [
                updatedAttempt,
                ...takeEnd<CreditCardInsertion>(state.length - 1, currentState)
              ];
        return trimState(updateState);
      });

    default:
      return state;
  }
};

export default reducer;
