/**
 * A reducer for lollipop.
 */
import { isActionOf } from "typesafe-actions";
import { Action } from "../actions/types";
import { lollipopKeyTagSave } from "../actions/lollipop";

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
