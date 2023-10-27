import { ActionType, createAsyncAction } from "typesafe-actions";
import { Trust } from "@pagopa/io-react-native-wallet";
import { ItWalletError } from "../../utils/errors/itwErrors";
import { RequestObject } from "../../utils/types";

/**
 * ITW RP initialization unsigned DPoP
 */
export const itwRpInitialization = createAsyncAction(
  "ITW_RP_INITIALIZATION_REQUEST",
  "ITW_RP_INITIALIZATION_SUCCESS",
  "ITW_RP_INITIALIZATION_FAILURE"
)<
  { authReqUrl: string; clientId: string },
  {
    requestObject: RequestObject;
    entity: Trust.RelyingPartyEntityConfiguration["payload"]["metadata"];
  },
  ItWalletError
>();

/**
 * ITW RP presentation prepare token
 */
export const itwRpPresentation = createAsyncAction(
  "ITW_RP_PRESENTATION_REQUEST",
  "ITW_RP_PRESENTATION_SUCCESS",
  "ITW_RP_PRESENTATION_FAILURE"
)<
  { authReqUrl: string; clientId: string },
  { status: string; response_code?: string },
  ItWalletError
>();

/**
 * Type for activation related actions.
 */
export type ItwRpActions =
  | ActionType<typeof itwRpInitialization>
  | ActionType<typeof itwRpPresentation>;
