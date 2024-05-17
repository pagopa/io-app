import { PidData } from "@pagopa/io-react-native-cie-pid";
import * as O from "fp-ts/lib/Option";
import { ActionType, createAsyncAction } from "typesafe-actions";
import { ItWalletError } from "../../../common/utils/itwErrorsUtils";
import { PidCredentialCatalogItem } from "../../../common/utils/itwMocksUtils";
import { StoredCredential } from "../../../common/utils/itwTypesUtils";

/**
 * Action which requests a PID issuing.
 */
export const itwIssuanceEid = createAsyncAction(
  "ITW_ISSUANCE_EID_REQUEST",
  "ITW_ISSUANCE_EID_SUCCESS",
  "ITW_ISSUANCE_EID_FAILURE"
)<
  PidCredentialCatalogItem & { pidData: PidData },
  O.Option<StoredCredential>,
  ItWalletError
>();

/**
 * Type for pid issuance related actions.
 */
export type ItwIssuanceEidActions = ActionType<typeof itwIssuanceEid>;
