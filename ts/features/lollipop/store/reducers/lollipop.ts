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
  lollipopRemoveEphermeralPublicKey,
  lollipopRemovePublicKey,
  lollipopSetEphermeralPublicKey,
  lollipopSetPublicKey,
  lollipopSetSupportedDevice
} from "../actions/lollipop";
import { GlobalState } from "../../../../store/reducers/types";
import { loginSuccess } from "../../../authentication/common/store/actions";
import { isDevEnv } from "./../../../../utils/environment";

type EphemeralKey = {
  ephemeralKeyTag: string;
  ephemeralPublicKey: PublicKey | undefined;
};

const ephemeralInitialState = {
  ephemeralKeyTag: uuid(),
  ephemeralPublicKey: undefined
};

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
  ephemeralKey: ephemeralInitialState
};

export default function lollipopReducer(
  state: LollipopState = initialLollipopState,
  action: Action
): LollipopState {
  switch (action.type) {
    case getType(loginSuccess):
      // When the user logs in, we generate a new ephemeral key
      // to be used for the login flow.
      return {
        ...state,
        keyTag: O.some(state.ephemeralKey.ephemeralKeyTag),
        publicKey: O.fromNullable(state.ephemeralKey.ephemeralPublicKey)
        // ephemeralKey: ephemeralInitialState
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
    case getType(lollipopSetEphermeralPublicKey):
      return {
        ...state,
        ephemeralKey: {
          ...state.ephemeralKey,
          ephemeralPublicKey: action.payload.publicKey
        }
      };
    case getType(lollipopRemoveEphermeralPublicKey):
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
