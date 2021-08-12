import { ActionType, createAsyncAction } from "typesafe-actions";
import { NetworkError } from "../../../../utils/errors";
import { EUCovidCertificateAuthCode } from "../../types/EUCovidCertificate";
import {
  EUCovidCertificateResponse,
  WithEUCovidCertAuthCode
} from "../../types/EUCovidCertificateResponse";

/**
 * The user requests the EU Covid certificate, starting from the auth_code
 */
export const euCovidCertificateGet = createAsyncAction(
  "EUCOVIDCERT_REQUEST",
  "EUCOVIDCERT_SUCCESS",
  "EUCOVIDCERT_FAILURE"
)<
  EUCovidCertificateAuthCode,
  EUCovidCertificateResponse,
  WithEUCovidCertAuthCode<NetworkError>
>();

export type EuCovidCertActions = ActionType<typeof euCovidCertificateGet>;
