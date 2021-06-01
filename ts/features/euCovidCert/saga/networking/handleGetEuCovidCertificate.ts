import { call, put } from "redux-saga/effects";
import { ActionType } from "typesafe-actions";
import { fromNullable } from "fp-ts/lib/Option";
import { euCovidCertificateGet } from "../../store/actions";
import { BackendEuCovidCertClient } from "../../api/backendEuCovidCert";
import { SagaCallReturnType } from "../../../../types/utils";
import {
  EUCovidCertificateResponse,
  EUCovidCertificateResponseFailure
} from "../../types/EUCovidCertificateResponse";
import { getNetworkError } from "../../../../utils/errors";
import { Certificate } from "../../../../../definitions/eu_covid_cert/Certificate";
import {
  EUCovidCertificate,
  EUCovidCertificateAuthCode
} from "../../types/EUCovidCertificate";
import { mixpanelTrack } from "../../../../mixpanel";

const mapKinds = new Map<number, EUCovidCertificateResponseFailure["kind"]>([
  [400, "wrongFormat"],
  [401, "genericError"],
  [403, "notFound"],
  [410, "notOperational"],
  [500, "genericError"],
  [504, "temporarilyNotAvailable"]
]);

// convert a failure response to the logical app representation of it
const convertFailure = (status: number): EUCovidCertificateResponseFailure => {
  const kind = mapKinds.get(status);
  return fromNullable(kind).foldL(
    () => {
      // track the conversion failure
      void mixpanelTrack("EUCOVIDCERT_CONVERT_FAILURE_ERROR", {
        status
      });
      // fallback to generic error
      return { kind: "genericError" };
    },
    k => ({ kind: k })
  );
};

// convert a success response to the logical app representation of it
const convertSuccess = (
  certificate: Certificate,
  authCode: EUCovidCertificateAuthCode
): EUCovidCertificateResponse => {
  const getCertificate = (): EUCovidCertificate | undefined => {
    switch (certificate.status) {
      case "valid":
        return {
          kind: "valid",
          id: certificate.id as EUCovidCertificate["id"],
          qrCode: {
            mimeType: certificate.qr_code.mime_type,
            content: certificate.qr_code.content
          },
          markdownPreview: certificate.info,
          markdownDetails: certificate.detail
        };
      case "revoked":
        return {
          kind: "revoked",
          id: certificate.id as EUCovidCertificate["id"],
          revokedOn: certificate.revoked_on
        };
      default:
        return undefined;
    }
  };
  return fromNullable(getCertificate()).foldL<EUCovidCertificateResponse>(
    () => {
      // track the conversion failure
      void mixpanelTrack("EUCOVIDCERT_CONVERT_SUCCESS_ERROR", {
        status: certificate.status
      });
      return { kind: "genericError", authCode };
    },
    value => ({ kind: "success", value, authCode })
  );
};

/**
 * Handle the remote call to retrieve the certificate data
 * @param getCertificate
 * @param action
 */
export function* handleGetEuCovidCertificate(
  getCertificate: ReturnType<typeof BackendEuCovidCertClient>["getCertificate"],
  action: ActionType<typeof euCovidCertificateGet.request>
) {
  const authCode = action.payload;
  try {
    const getCertificateResult: SagaCallReturnType<typeof getCertificate> = yield call(
      getCertificate,
      { getCertificateParams: { auth_code: authCode } }
    );
    if (getCertificateResult.isRight()) {
      if (getCertificateResult.value.status === 200) {
        // handled success
        yield put(
          euCovidCertificateGet.success(
            convertSuccess(getCertificateResult.value.value, authCode)
          )
        );
      } else {
        // handled failure
        yield put(
          euCovidCertificateGet.success({
            ...convertFailure(getCertificateResult.value.status),
            authCode
          })
        );
      }
    }
  } catch (e) {
    yield put(
      euCovidCertificateGet.failure({ ...getNetworkError(e), authCode })
    );
  }
}
