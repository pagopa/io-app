import {
  ActionType,
  createAsyncAction,
  createStandardAction
} from "typesafe-actions";
import { PidData } from "@pagopa/io-react-native-cie-pid";
import { PidCredentialCatalogItem } from "../../utils/itwMocksUtils";
import { StoredCredential } from "../../utils/itwTypesUtils";
import { ItWalletError } from "../../utils/itwErrorsUtils";

/**
 * Action which requests a PID issuing.
 */
export const itwIssuancePid = createAsyncAction(
  "ITW_CREDENTIALS_PID_REQUEST",
  "ITW_CREDENTIALS_PID_SUCCESS",
  "ITW_CREDENTIALS_PID_FAILURE"
)<
  PidCredentialCatalogItem & { pidData: PidData },
  StoredCredential,
  ItWalletError
>();

/**
 * Action which is dispatched when the user confirms the storage of the credential.
 */
export const itwIssuancePidStore = createStandardAction(
  "ITW_ISSUANCE_PID_STORE"
)<void>();

/**
 * Type for pid issuance related actions.
 */
export type ItwIssuancePidActions = ActionType<typeof itwIssuancePid>;
