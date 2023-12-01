import { ActionType, createAsyncAction } from "typesafe-actions";
import { Trust } from "@pagopa/io-react-native-wallet";
import { ItWalletError } from "../../utils/itwErrorsUtils";
import { RequestObject } from "../../utils/types";
import { RpData } from "../reducers/itwRpInitializationReducer";

/**
 * ITW RP initialization unsigned DPoP
 */
export const itwRpInitialization = createAsyncAction(
  "ITW_RP_INITIALIZATION_REQUEST",
  "ITW_RP_INITIALIZATION_SUCCESS",
  "ITW_RP_INITIALIZATION_FAILURE"
)<
  RpData,
  {
    requestObject: RequestObject;
    entity: Trust.RelyingPartyEntityConfiguration["payload"]["metadata"];
  } & RpData,
  ItWalletError
>();

/**
 * ITW RP presentation prepare token
 */
export const itwRpPresentation = createAsyncAction(
  "ITW_RP_PRESENTATION_REQUEST",
  "ITW_RP_PRESENTATION_SUCCESS",
  "ITW_RP_PRESENTATION_FAILURE"
)<void, { status: string; response_code?: string }, ItWalletError>();

/**
 * Type for activation related actions.
 */
export type ItwRpActions =
  | ActionType<typeof itwRpInitialization>
  | ActionType<typeof itwRpPresentation>;
