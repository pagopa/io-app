/**
 * Action types and action creator related to lollipop
 */

import { PublicKey } from "@pagopa/io-react-native-crypto";
import { ActionType, createStandardAction } from "typesafe-actions";

export const lollipopKeyTagSave = createStandardAction(
  "LOLLIPOP_KEY_TAG_SAVE"
)<{ keyTag: string }>();

export const lollipopSetPublicKey = createStandardAction(
  "LOLLIPOP_SET_PUBLIC_KEY"
)<{ publicKey: PublicKey }>();

export type LollipopActions = ActionType<
  typeof lollipopKeyTagSave | typeof lollipopSetPublicKey
>;
