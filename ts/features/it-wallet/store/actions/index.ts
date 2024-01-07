import { ItwPersistedCredentialsActions } from "./itwPersistedCredentialsActions";
import { ItwIssuancePidCieAuthActions } from "./issuing/pid/itwIssuancePidCieActions";
import { ItwActivationActions } from "./itwActivationActions";
import { ItwWiaActions } from "./itwWiaActions";
import { ItwLifecycleActions } from "./itwLifecycleActions";
import { ItwRpActions } from "./presentation/remote/itwPrRemotePidActions";
import { itwPrRemoteCredentialInit } from "./presentation/remote/itwPrRemoteCredentialActions";
import { ItwIssuanceCredentialActions } from "./issuing/credential/itwIssuanceCredentialActions";
import { ItwProximityActions } from "./presentation/proximity/itwProximityActions";
import { ItwIssuancePidActions } from "./issuing/pid/itwIssuancePidActions";

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
