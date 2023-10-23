import { ItwCredentialsActions } from "./itwCredentialsActions";
import { ItwCieAuthenticationActions } from "./itwCieActions";
import { ItwActivationActions } from "./itwActivationActions";
import { ItwWiaActions } from "./itwWiaActions";
import { ItwLifecycleActions } from "./itwLifecycleActions";
import { ItwRpActions } from "./itwRpActions";
import { ItwPresentationChecks } from "./new/itwPresentationActions";

/**
 * Action types for the IT Wallet feature
 */
export type ItWalletActions =
  | ItwActivationActions
  | ItwWiaActions
  | ItwLifecycleActions
  | ItwCredentialsActions
  | ItwCieAuthenticationActions
  | ItwRpActions
  | ItwPresentationChecks;
