import { ItwPersistedCredentialsActions } from "./itwPersistedCredentialsActions";
import { ItwIssuanceCieActions } from "./issuing/pid/itwIssuancePidCieActions";
import { ItwActivationActions } from "./itwActivationActions";
import { ItwWiaActions } from "./itwWiaActions";
import { ItwLifecycleActions } from "./itwLifecycleActions";
import { ItwRpActions } from "./presentation/remote/itwPrRemotePidActions";
import { itwPrRemoteCredentialInit } from "./presentation/remote/itwPrRemoteCredentialActions";
import { ItwIssuanceCredentialActions } from "./issuing/itwIssuanceCredentialActions";
import { ItwProximityActions } from "./itwProximityActions";
import { ItwIssuancePidActions } from "./issuing/pid/itwIssuancePidActions";

/**
 * Action types for the IT Wallet feature
 */
export type ItWalletActions =
  | ItwWiaActions
  | ItwActivationActions
  | ItwIssuancePidActions
  | ItwIssuanceCredentialActions
  | ItwLifecycleActions
  | ItwPersistedCredentialsActions
  | ItwIssuanceCieActions
  | ItwRpActions
  | itwPrRemoteCredentialInit
  | ItwProximityActions;
