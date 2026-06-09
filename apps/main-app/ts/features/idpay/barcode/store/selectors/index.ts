import * as pot from "@pagopa/ts-commons/lib/pot";
import { pipe } from "fp-ts/lib/function";
import { createSelector } from "reselect";
import { GlobalState } from "../../../../../store/reducers/types";
import { calculateIdPayBarcodeSecondsToExpire } from "../../utils";
import { IdPayBarcodeState, IdPayStaticCodeState } from "../types";

const idPayBarcodeSelector = (state: GlobalState): IdPayBarcodeState =>
  state.features.idPay.barcode;

const idPayStaticCodeSelector = (state: GlobalState): IdPayStaticCodeState =>
  state.features.idPay.staticCode;

export const idPayBarcodeByInitiativeIdSelector = createSelector(
  idPayBarcodeSelector,
  state => (initiativeId: string) => state[initiativeId] ?? pot.none
  // type checker does not complain if the null check is removed, but
  // since it's a map access it could very well return undefined
);

// gracefully failing expire time selector
export const idPayBarcodeSecondsTillExpireSelector = createSelector(
  idPayBarcodeByInitiativeIdSelector,
  getInitiative => (initiativeId: string) =>
    pipe(
      pot.map(getInitiative(initiativeId), barcode =>
        calculateIdPayBarcodeSecondsToExpire(barcode)
      ),
      seconds => pot.getOrElse(seconds, 0)
    )
);

export const idPayStaticCodeByInitiativeIdSelector = createSelector(
  idPayStaticCodeSelector,
  state => (initiativeId: string) => state[initiativeId] ?? pot.none
);
