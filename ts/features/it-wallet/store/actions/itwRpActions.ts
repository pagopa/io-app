import {
  ActionType,
  createAsyncAction,
  createStandardAction
} from "typesafe-actions";
import { RelyingPartySolution } from "@pagopa/io-react-native-wallet";
import {
  RequestObject,
  RpEntityConfiguration
} from "@pagopa/io-react-native-wallet/lib/typescript/rp/types";
import { ItWalletError } from "../../utils/errors/itwErrors";

/**
 * Start ITW RP activation
 */
export const itwRpStart = createStandardAction("ITW_RP_START")<string>();

/**
 * Stop ITW RP activation
 */
export const itwRpStop = createStandardAction("ITW_RP_STOP")<void>();

/**
 * Complete ITW RP activation
 */
export const itwRpCompleted = createStandardAction("ITW_RP_COMPLETED")<void>();

/**
 * ITW RP initialization unsigned DPoP
 */
export const itwRpInitialization = createAsyncAction(
  "ITW_RP_INITIALIZATION_REQUEST",
  "ITW_RP_INITIALIZATION_SUCCESS",
  "ITW_RP_INITIALIZATION_FAILURE"
)<
  { RP: RelyingPartySolution; authReqUrl: string },
  { requestObject: RequestObject; entity: RpEntityConfiguration },
  ItWalletError
>();

/**
 * ITW RP presentation prepare token
 */
export const itwRpPresentation = createAsyncAction(
  "ITW_RP_PRESENTATION_REQUEST",
  "ITW_RP_PRESENTATION_SUCCESS",
  "ITW_RP_PRESENTATION_FAILURE"
)<RelyingPartySolution, string, ItWalletError>();

/**
 * Type for activation related actions.
 */
export type ItwRpActions =
  | ActionType<typeof itwRpStart>
  | ActionType<typeof itwRpStop>
  | ActionType<typeof itwRpCompleted>
  | ActionType<typeof itwRpInitialization>
  | ActionType<typeof itwRpPresentation>;
