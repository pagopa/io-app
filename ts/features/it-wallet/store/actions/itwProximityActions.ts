import {
  DocumentRequest,
  EventData as ProximityEvent
} from "@pagopa/io-react-native-proximity";

/**
 * Action types and action creator related to Proximity
 */

import {
  ActionType,
  createAsyncAction,
  createStandardAction
} from "typesafe-actions";
import { ItWalletError } from "../../utils/itwErrorsUtils";

export enum ProximityManagerStatusEnum {
  STARTED = "STARTED",
  STOPPED = "STOPPED"
}

export const proximityManagerStatus = createStandardAction(
  "ITW_PROXIMITY_MANAGER_STATUS"
)<{
  status: ProximityManagerStatusEnum;
}>();

export const startProximityManager = createAsyncAction(
  "ITW_PROXIMITY_START_REQUEST",
  "ITW_PROXIMITY_START_SUCCESS",
  "ITW_PROXIMITY_START_FAILURE"
)<
  {
    onEvent: (event: ProximityEvent) => void;
    onSuccess: (event: ProximityEvent) => void;
    onError: (event: ProximityEvent) => void;
    onDocumentsRequestReceived: (_: Array<DocumentRequest>) => void;
  },
  boolean,
  ItWalletError
>();

export const stopProximityManager = createAsyncAction(
  "ITW_PROXIMITY_STOP_REQUEST",
  "ITW_PROXIMITY_STOP_SUCCESS",
  "ITW_PROXIMITY_STOP_FAILURE"
)<void, boolean, ItWalletError>();

export const generateQrCode = createAsyncAction(
  "ITW_PROXIMITY_QRCODE_REQUEST",
  "ITW_PROXIMITY_QRCODE_SUCCESS",
  "ITW_PROXIMITY_QRCODE_FAILURE"
)<void, string, ItWalletError>();

export const hasBLEFeature = createAsyncAction(
  "ITW_PROXIMITY_HAS_BLE_FEATURE_REQUEST",
  "ITW_PROXIMITY_HAS_BLE_FEATURE_SUCCESS",
  "ITW_PROXIMITY_HAS_BLE_FEATURE_FAILURE"
)<void, boolean, ItWalletError>();

export const bleIsEnabled = createAsyncAction(
  "ITW_BLE_IS_ENABLED_REQUEST",
  "ITW_BLE_IS_ENABLED_SUCCESS",
  "ITW_BLE_IS_ENABLED_FAILURE"
)<void, boolean, ItWalletError>();

export type ProximityErrorReason = ProximityEvent["type"] | "GENERIC";

export type ItwProximityActions =
  | ActionType<typeof bleIsEnabled>
  | ActionType<typeof hasBLEFeature>
  | ActionType<typeof startProximityManager>
  | ActionType<typeof stopProximityManager>
  | ActionType<typeof generateQrCode>
  | ActionType<typeof proximityManagerStatus>;
