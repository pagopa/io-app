/**
 * Action types and action creator related to lollipop
 */

import { PublicKey } from "@pagopa/io-react-native-crypto";
import { ActionType, createStandardAction } from "typesafe-actions";

type KeyTagSavePayload = {
  keyTag: string;
};

type SetPublicKeyPayload = {
  publicKey: PublicKey;
};

export const lollipopKeyTagSave = createStandardAction(
  "LOLLIPOP_KEY_TAG_SAVE"
)<KeyTagSavePayload>();

export const lollipopSetPublicKey = createStandardAction(
  "LOLLIPOP_SET_PUBLIC_KEY"
)<SetPublicKeyPayload>();

export const lollipopRemovePublicKey = createStandardAction(
  "LOLLIPOP_REMOVE_PUBLIC_KEY"
)();

export const lollipopSetSupportedDevice = createStandardAction(
  "LOLLIPOP_SET_SUPPORTED_DEVICE"
)<boolean>();

export type LollipopActions = ActionType<
  | typeof lollipopKeyTagSave
  | typeof lollipopSetPublicKey
  | typeof lollipopRemovePublicKey
  | typeof lollipopSetSupportedDevice
>;
