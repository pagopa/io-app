import { getType } from "typesafe-actions";
import sha from "sha.js";
import { fromNullable } from "fp-ts/lib/Option";
import { index, take, takeEnd } from "fp-ts/lib/Array";
import {
  addWalletCreditCardFailure,
  addWalletCreditCardRequest,
  addWalletCreditCardSuccess,
  creditCardCheckout3dsRedirectionUrls
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
  failureReason?: "GENERIC_ERROR" | "ALREADY_EXISTS";
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
      return fromNullable(payload.creditcard?.creditCard).fold<
        CreditCardInsertionState
      >(state, c => {
        const hashedPan = sha("sha256").update(c.pan).digest("hex");
        // ensure to have only a single item representing the card insertion
        const newState = state.filter(c => c.hashedPan !== hashedPan);
        const requestedAttempt: CreditCardInsertion = {
          startDate: new Date(),
          hashedPan,
          blurredPan: c.pan.slice(-4),
          expireMonth: c.expireMonth,
          expireYear: c.expireYear
        };
        return trimState([requestedAttempt, ...newState]);
      });
    case getType(addWalletCreditCardSuccess):
      const currentState = [...state];
      const wallet = action.payload.data;
      // We expect addWalletCreditCardRequest not to be dispatched twice in a row,
      // so the current addWalletCreditCardRequest action refers to the last card added to the history.
      // As we don't pass an idientifer for the case, we have no other method do relate the success action to its request.
      const maybeAttempt = index<CreditCardInsertion>(0, currentState);
      return maybeAttempt.fold(state, attempt => {
        const succedeedAttempt = {
          ...attempt,
          wallet: {
            idWallet: wallet.idWallet,
            idCreditCard: wallet.creditCard?.id,
            brand: wallet.creditCard?.brand
          }
        };
        const updateState =
          state.length === 0
            ? [succedeedAttempt]
            : // place the update item at 0-index position
              // tailed by the others element 1...N
              [
                succedeedAttempt,
                ...takeEnd<CreditCardInsertion>(state.length - 1, currentState)
              ];
        return take(MAX_HISTORY_LENGTH, updateState);
      });

    case getType(addWalletCreditCardFailure):
      const failureReason = action.payload;
      // We expect addWalletCreditCardRequest not to be dispatched twice in a row,
      // so the current addWalletCreditCardFailure action refers to the last card added to the history.
      // As we don't pass an idientifer for the case, we have no other method do relate the success action to its request.
      return index<CreditCardInsertion>(0, [...state]).fold(state, attempt => {
        const failedAttempt = {
          ...attempt,
          failureReason
        };
        const updateState =
          state.length === 0
            ? [failedAttempt]
            : // place the update item on 0-index position
              // followed by the others element 1...N
              [
                failedAttempt,
                ...takeEnd<CreditCardInsertion>(state.length - 1, [...state])
              ];
        return trimState(updateState);
      });
    case getType(creditCardCheckout3dsRedirectionUrls):
      // TODO stub, to be implemented
      return state;

    default:
      return state;
  }
};

export default reducer;
