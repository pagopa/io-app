import { ActionType, createAsyncAction } from "typesafe-actions";
import { ItWalletError } from "../../utils/itwErrorsUtils";
import {
  ItwPrRemotePidInit,
  ItwPrRemotePidResult
} from "../reducers/itwPrRemotePidReducer";

export type ItwPrRemotePidInitData = {
  authReqUrl: string;
  clientId: string;
};

/**
 * ITW RP initialization unsigned DPoP
 */
export const itwPrRemotePidInit = createAsyncAction(
  "ITW_PR_REMOTE_PID_INIT_REQUEST",
  "ITW_PR_REMOTE_PID_INIT_SUCCESS",
  "ITW_PR_REMOTE_PID_INIT_FAILURE"
)<ItwPrRemotePidInitData, ItwPrRemotePidInit, ItWalletError>();

/**
 * ITW RP presentation prepare token
 */
export const itwPrRemotePidPresentation = createAsyncAction(
  "ITW_PR_REMOTE_PID_PRESENTATION_REQUEST",
  "ITW_PR_REMOTE_PID_PRESENTATION_SUCCESS",
  "ITW_PR_REMOTE_PID_PRESENTATION_FAILURE"
)<void, ItwPrRemotePidResult, ItWalletError>();

/**
 * Type for activation related actions.
 */
export type ItwRpActions =
  | ActionType<typeof itwPrRemotePidInit>
  | ActionType<typeof itwPrRemotePidPresentation>;
