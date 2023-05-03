/**
 * A reducer for lollipop.
 */
import * as O from "fp-ts/lib/Option";
import { getType } from "typesafe-actions";
import { PublicKey } from "@pagopa/io-react-native-crypto";
import { createSelector } from "reselect";
import { Action } from "../../../../store/actions/types";
import {
  lollipopKeyTagSave,
  lollipopRemovePublicKey,
  lollipopSetPublicKey,
  lollipopSetSupportedDevice
} from "../actions/lollipop";
import { GlobalState } from "../../../../store/reducers/types";

export type LollipopState = Readonly<{
  keyTag: O.Option<string>;
  publicKey: O.Option<PublicKey>;
  supportedDevice: boolean;
}>;

export const initialLollipopState: LollipopState = {
  keyTag: O.none,
  publicKey: O.none,
  supportedDevice: true
};

export default function lollipopReducer(
  state: LollipopState = initialLollipopState,
  action: Action
): LollipopState {
  switch (action.type) {
    case getType(lollipopKeyTagSave):
      return {
        ...state,
        keyTag: O.some(action.payload.keyTag)
      };
    case getType(lollipopSetPublicKey):
      return {
        ...state,
        publicKey: O.some(action.payload.publicKey)
      };
    case getType(lollipopRemovePublicKey):
      return {
        ...state,
        publicKey: O.none
      };
    case getType(lollipopSetSupportedDevice):
      return {
        ...state,
        supportedDevice: action.payload
      };
    default:
      return state;
  }
}

export const lollipopSelector = (state: GlobalState) => state.lollipop;
export const lollipopKeyTagSelector = (state: GlobalState) =>
  state.lollipop.keyTag;
export const lollipopPublicKeySelector = (state: GlobalState) =>
  state.lollipop.publicKey;
export const isDeviceSupportedSelector = createSelector(
  lollipopSelector,
  lollipopState => lollipopState.supportedDevice
);
