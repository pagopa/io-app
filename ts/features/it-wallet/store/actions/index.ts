import { ItwPersistedCredentialsActions } from "./itwPersistedCredentialsActions";
import { ItwIssuancePidCieAuthActions } from "./itwIssuancePidCieActions";
import { ItwActivationActions } from "./itwActivationActions";
import { ItwWiaActions } from "./itwWiaActions";
import { ItwLifecycleActions } from "./itwLifecycleActions";
import { ItwRpActions } from "./itwPrRemotePidActions";
import { itwPrRemoteCredentialInit } from "./itwPrRemoteCredentialActions";
import { ItwIssuanceCredentialActions } from "./itwIssuanceCredentialActions";
import { ItwProximityActions } from "./itwProximityActions";
import { ItwIssuancePidActions } from "./itwIssuancePidActions";

/**
 * Action types for the IT Wallet feature
 */
export type ItWalletActions =
  /* GENERIC */
  | ItwLifecycleActions
  | ItwWiaActions
  | ItwActivationActions
  /* ISSUANCE */
  | ItwIssuancePidCieAuthActions
  | ItwIssuancePidActions
  | ItwIssuanceCredentialActions
  /* PERSISTED CREDENTIALS */
  | ItwPersistedCredentialsActions
  /* PRESENTATION */
  | ItwRpActions
  | itwPrRemoteCredentialInit
  | ItwProximityActions;
