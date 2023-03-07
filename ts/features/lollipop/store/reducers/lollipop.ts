/**
 * A reducer for lollipop.
 */
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { createSelector } from "reselect";
import { getType } from "typesafe-actions";
import { PublicKey } from "@pagopa/io-react-native-crypto";
import { Action } from "../../../../store/actions/types";
import { lollipopKeyTagSave, lollipopSetPublicKey } from "../actions/lollipop";
import { GlobalState } from "../../../../store/reducers/types";

export type LollipopState = Readonly<{
  keyTag?: string;
  publicKey?: PublicKey;
}>;

export const initialLollipopState: LollipopState = {
  keyTag: undefined,
  publicKey: undefined
};

export default function lollipopReducer(
  state: LollipopState = initialLollipopState,
  action: Action
): LollipopState {
  switch (action.type) {
    case getType(lollipopKeyTagSave):
      return {
        ...state,
        keyTag: action.payload.keyTag
      };
    case getType(lollipopSetPublicKey):
      return {
        ...state,
        publicKey: action.payload.publicKey
      };
    default:
      return state;
  }
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
