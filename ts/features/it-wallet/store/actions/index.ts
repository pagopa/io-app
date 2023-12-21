import { ItwCredentialsActions } from "./itwCredentialsActions";
import { ItwCieAuthenticationActions } from "./itwCieActions";
import { ItwActivationActions } from "./itwActivationActions";
import { ItwWiaActions } from "./itwWiaActions";
import { ItwLifecycleActions } from "./itwLifecycleActions";
import { ItwRpActions } from "./itwRpActions";
import { ItwPresentationChecks } from "./new/itwPresentationActions";
import { itwIssuanceActions } from "./new/itwIssuanceActions";
import { ItwProximityActions } from "./itwProximityActions";

/**
 * Action types for the IT Wallet feature
 */
export type ItWalletActions =
  | itwIssuanceActions
  | ItwActivationActions
  | ItwWiaActions
  | ItwLifecycleActions
  | ItwCredentialsActions
  | ItwCieAuthenticationActions
  | ItwRpActions
  | ItwPresentationChecks
  | ItwProximityActions;
