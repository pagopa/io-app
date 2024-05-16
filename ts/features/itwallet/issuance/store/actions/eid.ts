import {
  ActionType,
  createAsyncAction,
  createStandardAction
} from "typesafe-actions";
import { PidData } from "@pagopa/io-react-native-cie-pid";
import { PidCredentialCatalogItem } from "../../../common/utils/itwMocksUtils";
import { StoredCredential } from "../../../common/utils/itwTypesUtils";
import { ItWalletError } from "../../../common/utils/itwErrorsUtils";

/**
 * Action which requests a PID issuing.
 */
export const itwIssuanceEid = createAsyncAction(
  "ITW_ISSUANCE_EID_REQUEST",
  "ITW_ISSUANCE_EID_SUCCESS",
  "ITW_ISSUANCE_EID_FAILURE"
)<
  PidCredentialCatalogItem & { pidData: PidData },
  StoredCredential,
  ItWalletError
>();

/**
 * Action which requests a PID storing.
 */
export const itwIssuancePidStore = createStandardAction(
  "ITW_ISSUANCE_EID_STORE"
)<StoredCredential>();

/**
 * Type for pid issuance related actions.
 */
export type ItwIssuanceEidActions =
  | ActionType<typeof itwIssuanceEid>
  | ActionType<typeof itwIssuancePidStore>;
