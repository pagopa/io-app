import { getType } from "typesafe-actions";
import sha from "sha.js";
import { fromNullable } from "fp-ts/lib/Option";
import { addWalletCreditCardRequest } from "../../actions/wallet/wallets";
import { Action } from "../../actions/types";

type CreditCardHistoryItem = {
  startDate: Date;
  hashedPan: string; // hashed PAN
  blurredPan: string; // anonymized PAN
  expireMonth: string;
  expireYear: string;
};

export type CreditCardHistoryState = ReadonlyArray<CreditCardHistoryItem>;

const reducer = (
  state: CreditCardHistoryState = [],
  action: Action
): CreditCardHistoryState => {
  switch (action.type) {
    case getType(addWalletCreditCardRequest):
      const payload = action.payload;
      const cc = fromNullable(payload.creditcard?.creditCard);
      return cc.fold<CreditCardHistoryState>(state, c => {
        const hashedPan = sha("sha256").update(c.pan).digest("hex");
        const newState = state.filter(c => c.hashedPan !== hashedPan);
        const creditCardItem: CreditCardHistoryItem = {
          startDate: new Date(),
          hashedPan,
          blurredPan: c.pan.slice(-4),
          expireMonth: c.expireMonth,
          expireYear: c.expireYear
        };
        return [...newState, creditCardItem];
      });

    default:
      return state;
  }
};

export default reducer;
