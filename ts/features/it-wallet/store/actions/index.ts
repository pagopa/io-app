import { ItwCredentialsActions } from "./itwCredentialsActions";
import { ItwCieAuthenticationActions } from "./issuing/pid/itwCieActions";
import { ItwActivationActions } from "./itwActivationActions";
import { ItwWiaActions } from "./generic/itwWiaActions";
import { ItwLifecycleActions } from "./itwLifecycleActions";
import { ItwRpActions } from "./presentation/remote/itwPrRemotePidActions";
import { itwPrRemoteCredentialInit } from "./presentation/remote/itwPrRemoteCredentialActions";
import { itwIssuanceActions } from "./itwIssuanceActions";
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
  | itwPrRemoteCredentialInit
  | ItwProximityActions;
