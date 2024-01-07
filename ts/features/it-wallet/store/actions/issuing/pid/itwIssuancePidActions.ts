import { ActionType, createAsyncAction } from "typesafe-actions";
import { PidData } from "@pagopa/io-react-native-cie-pid";
import { PidCredentialCatalogItem } from "../../../../utils/mocks";
import { StoredCredential } from "../../../../utils/types";
import { ItWalletError } from "../../../../utils/itwErrorsUtils";

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
 * Type for pid issuance related actions.
 */
export type ItwIssuancePidActions = ActionType<typeof itwIssuancePid>;
