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
  "ITW_ISSUANCE_PID_REQUEST",
  "ITW_ISSUANCE_PID_SUCCESS",
  "ITW_ISSUANCE_PID_FAILURE"
)<
  PidCredentialCatalogItem & { pidData: PidData },
  StoredCredential,
  ItWalletError
>();

/**
 * Action which requests a PID storing.
 */
export const itwIssuancePidStore = createStandardAction(
  "ITW_ISSUANCE_PID_STORE"
)<StoredCredential>();

/**
 * Type for pid issuance related actions.
 */
export type ItwIssuancePidActions = ActionType<typeof itwIssuancePid>;
