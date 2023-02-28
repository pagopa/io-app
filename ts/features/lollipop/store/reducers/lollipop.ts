/**
 * A reducer for lollipop.
 */
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { createSelector } from "reselect";
import { isActionOf } from "typesafe-actions";
import { Action } from "../../../../store/actions/types";
import { lollipopKeyTagSave } from "../actions/lollipop";
import { GlobalState } from "../../../../store/reducers/types";

export type LollipopState = Readonly<{
  keyTag?: string;
}>;

export const initialLollipopState: LollipopState = {
  keyTag: undefined
};

export default function lollipopReducer(
  state: LollipopState = initialLollipopState,
  action: Action
): LollipopState {
  if (isActionOf(lollipopKeyTagSave, action)) {
    return {
      ...state,
      keyTag: action.payload.keyTag
    };
  }
  return state;
}

export const lollipopSelector = (state: GlobalState) => state.lollipop;

export const lollipopKeyTagSelector = createSelector(
  lollipopSelector,
  (lollipop): O.Option<string> =>
    pipe(
      lollipop,
      O.fromNullable,
      O.chainNullableK(lollipop => lollipop.keyTag)
    )
);
