/**
 * A reducer for lollipop.
 */
import * as O from "fp-ts/lib/Option";
import { getType } from "typesafe-actions";
import { PublicKey } from "@pagopa/io-react-native-crypto";
import { createSelector } from "reselect";
import { v4 as uuid } from "uuid";
import { Action } from "../../../../store/actions/types";
import {
  lollipopKeyTagSave,
  lollipopRemoveEphemeralPublicKey,
  lollipopRemovePublicKey,
  lollipopSetEphemeralPublicKey,
  lollipopSetPublicKey,
  lollipopSetSupportedDevice
} from "../actions/lollipop";
import { GlobalState } from "../../../../store/reducers/types";
import {
  loginFailure,
  loginSuccess
} from "../../../authentication/common/store/actions";
import {
  activeSessionLoginFailure,
  activeSessionLoginSuccess
} from "../../../authentication/activeSessionLogin/store/actions";
import { isDevEnv } from "./../../../../utils/environment";

type EphemeralKey = {
  ephemeralKeyTag: string;
  ephemeralPublicKey: PublicKey | undefined;
};
// The initial state is inserted as the return value of a function
// for regenerating a new UUID every time we need a new initial state.
const ephemeralInitialState = () => ({
  ephemeralKeyTag: uuid(),
  ephemeralPublicKey: undefined
});

export type LollipopState = Readonly<{
  keyTag: O.Option<string>;
  publicKey: O.Option<PublicKey>;
  supportedDevice: boolean;
  ephemeralKey: EphemeralKey;
}>;

export const initialLollipopState: LollipopState = {
  keyTag: O.none,
  publicKey: O.none,
  supportedDevice: true,
  ephemeralKey: ephemeralInitialState()
};

export default function lollipopReducer(
  state: LollipopState = initialLollipopState,
  action: Action
): LollipopState {
  switch (action.type) {
    case getType(loginSuccess):
    case getType(activeSessionLoginSuccess):
      // When the user logs in successfully, the ephemeral key
      // he logged in with is saved as the main key and a
      // new ephemeral key is set, ready to be used for a new login
      return {
        ...state,
        keyTag: O.some(state.ephemeralKey.ephemeralKeyTag),
        publicKey: O.fromNullable(state.ephemeralKey.ephemeralPublicKey),
        ephemeralKey: ephemeralInitialState()
      };
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
    case getType(lollipopSetEphemeralPublicKey):
      return {
        ...state,
        ephemeralKey: {
          ...state.ephemeralKey,
          ephemeralPublicKey: action.payload.publicKey
        }
      };
    case getType(lollipopRemoveEphemeralPublicKey):
    case getType(loginFailure):
    case getType(activeSessionLoginFailure):
      // Clear the ephemeral public key from state.
      // For loginFailure: ensures a clean state if the user attempts to log in again.
      // For lollipopRemoveEphemeralPublicKey: used to explicitly discard the public key.
      return {
        ...state,
        ephemeralKey: {
          ...state.ephemeralKey,
          ephemeralPublicKey: undefined
        }
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

// Selectors for Lollipop state
// Ephemeral key selectors
export const ephemeralKeyTagSelector = (state: GlobalState) =>
  state.lollipop.ephemeralKey.ephemeralKeyTag;
export const ephemeralPublicKeySelector = (state: GlobalState) =>
  state.lollipop.ephemeralKey.ephemeralPublicKey;
// Original keyTag and publicKey selectors
const lollipopSelector = (state: GlobalState) => state.lollipop;
export const lollipopKeyTagSelector = (state: GlobalState) =>
  state.lollipop.keyTag;
export const lollipopPublicKeySelector = (state: GlobalState) =>
  state.lollipop.publicKey;
export const isDeviceSupportedSelector = createSelector(
  lollipopSelector,
  lollipopState => lollipopState.supportedDevice
);

export const testable = isDevEnv
  ? {
      lollipopSelector
    }
  : undefined;
