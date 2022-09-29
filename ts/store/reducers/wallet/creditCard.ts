import * as AR from "fp-ts/lib/Array";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { createSelector } from "reselect";
import sha from "sha.js";
import { getType } from "typesafe-actions";
import { getLookUpId } from "../../../utils/pmLookUpId";
import { clearCache } from "../../actions/profile";
import { Action } from "../../actions/types";
import { addCreditCardOutcomeCode } from "../../actions/wallet/outcomeCode";
import {
  addCreditCardWebViewEnd,
  AddCreditCardWebViewEndReason,
  addWalletCreditCardFailure,
  addWalletCreditCardRequest,
  addWalletCreditCardSuccess,
  addWalletNewCreditCardSuccess,
  CreditCardFailure,
  creditCardPaymentNavigationUrls
} from "../../actions/wallet/wallets";
import { GlobalState } from "../types";

export type CreditCardInsertion = {
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
  webViewCloseReason?: AddCreditCardWebViewEndReason;
  failureReason?: CreditCardFailure;
  payNavigationUrls?: ReadonlyArray<string>;
  onboardingComplete: boolean;
  outcomeCode?: string;
  lookupId?: string;
};

// The state is modeled as a stack on which the last element is added at the head
export type CreditCardInsertionState = ReadonlyArray<CreditCardInsertion>;
export const MAX_HISTORY_LENGTH = 15;

const trimState = (state: CreditCardInsertionState) =>
  AR.takeLeft(MAX_HISTORY_LENGTH)([...state]);

/**
 * Given a current state (which is represented by a stack), replace the head with a given item
 *
 * We expect addWalletCreditCardRequest not to be dispatched twice in a row,
 * so the current addWalletCreditCardRequest action refers to the last card added to the history.
 * As we don't pass an idientifer for the case, we have no other method do relate the success action to its request.
 * @param state the stack og items
 * @param updaterFn a functor on an item which transform it according to the change needed
 *
 * @returns the new stack with the head changed
 */
const updateStateHead = (
  state: CreditCardInsertionState,
  updaterFn: (item: CreditCardInsertion) => CreditCardInsertion
): CreditCardInsertionState =>
  pipe(
    AR.lookup<CreditCardInsertion>(0, [...state]),
    O.map(updaterFn),
    O.fold(
      () => state,
      updateItem => {
        const [, ...tail] = state;
        return trimState([updateItem, ...AR.takeRight(tail.length)(tail)]);
      }
    )
  );
const INITIAL_STATE: CreditCardInsertionState = [];
/**
 * card insertion follow these step:
 * 1. request to add a credit card: addWalletCreditCardRequest
 * 2. adding result: addWalletCreditCardSuccess or addWalletCreditCardFailure
 * 3. if 2 is addWalletCreditCardSuccess -> creditCardCheckout3dsRequest
 * 4. creditCardCheckout3dsSuccess
 * 5. credit card payment verification outcome: payCreditCardVerificationSuccess | payCreditCardVerificationFailure
 * 6. addWalletNewCreditCardSuccess completed onboarded (add + pay + checkout)
 * see: https://docs.google.com/presentation/d/1nikV9vNGCFE_9Mxt31ZQuqzQXeJucMW3kdJvtjoBtC4/edit#slide=id.ga4eb40050a_0_4
 *
 * step 1 adds an item into the history.
 * all further steps add their info referring the item in the 0-index position
 * that is the one added in the step 1
 *
 * Please note that actions are meant to be executed in order and the head of the stack is the one to be updated.
 */
const reducer = (
  state: CreditCardInsertionState = INITIAL_STATE,
  action: Action
): CreditCardInsertionState => {
  switch (action.type) {
    case getType(addWalletCreditCardRequest):
      const payload = action.payload;
      return pipe(
        payload.creditcard?.creditCard,
        O.fromNullable,
        O.fold(
          () => state,
          c => {
            const hashedPan = sha("sha256").update(c.pan).digest("hex");
            // ensure to have only a single item representing the card insertion
            const newState = state.filter(c => c.hashedPan !== hashedPan);
            const requestedAttempt: CreditCardInsertion = {
              startDate: new Date(),
              hashedPan,
              blurredPan: c.pan.slice(-4),
              expireMonth: c.expireMonth,
              expireYear: c.expireYear,
              onboardingComplete: false,
              lookupId: getLookUpId()
            };
            return trimState([requestedAttempt, ...newState]);
          }
        )
      );
    case getType(addWalletCreditCardSuccess):
      return updateStateHead(state, attempt => {
        const wallet = action.payload.data;
        return {
          ...attempt,
          wallet: {
            idWallet: wallet.idWallet,
            idCreditCard: wallet.creditCard?.id,
            brand: wallet.creditCard?.brand
          }
        };
      });

    case getType(addWalletCreditCardFailure):
      return updateStateHead(state, attempt => ({
        ...attempt,
        failureReason: action.payload
      }));
    case getType(creditCardPaymentNavigationUrls):
      return updateStateHead(state, attempt => ({
        ...attempt,
        payNavigationUrls: action.payload
      }));

    case getType(addWalletNewCreditCardSuccess):
      return updateStateHead(state, attempt => ({
        ...attempt,
        onboardingComplete: true
      }));
    case getType(addCreditCardOutcomeCode):
      return updateStateHead(state, attempt => ({
        ...attempt,
        outcomeCode: pipe(
          action.payload,
          O.getOrElse(() => "n/a")
        )
      }));
    case getType(addCreditCardWebViewEnd):
      return updateStateHead(state, attempt => ({
        ...attempt,
        webViewCloseReason: action.payload
      }));
    case getType(clearCache): {
      return INITIAL_STATE;
    }

    default:
      return state;
  }
};

export default reducer;

const creditCardAttempts = (state: GlobalState) =>
  state.payments.creditCardInsertion;

// return the list of credit card onboarding attempts
export const creditCardAttemptsSelector = createSelector(
  creditCardAttempts,
  (ca: CreditCardInsertionState): CreditCardInsertionState => ca
);
