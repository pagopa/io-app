import { ItwCredentialsActions } from "./itwCredentialsActions";
import { ItwCieAuthenticationActions } from "./itwCieActions";
import { ItwActivationActions } from "./itwActivationActions";
import { ItwWiaActions } from "./itwWiaActions";
import { ItwLifecycleActions } from "./itwLifecycleActions";

/**
 * Action types for the IT Wallet feature
 */
export type ItWalletActions =
  | ItwActivationActions
  | ItwWiaActions
  | ItwLifecycleActions
  | ItwCredentialsActions
  | ItwCieAuthenticationActions;
