import { Either, left, right } from "fp-ts/lib/Either";
import { expectSaga } from "redux-saga-test-plan";
import { ActionType } from "typesafe-actions";
import { handleGetEuCovidCertificate } from "../handleGetEuCovidCertificate";
import { appReducer } from "../../../../../store/reducers";
import { euCovidCertificateGet } from "../../../store/actions";
import {
  EUCovidCertificate,
  EUCovidCertificateAuthCode
} from "../../../types/EUCovidCertificate";
import { Certificate } from "../../../../../../definitions/eu_covid_cert/Certificate";
import {
  RevokedCertificate,
  StatusEnum
} from "../../../../../../definitions/eu_covid_cert/RevokedCertificate";
import {
  ValidCertificate,
  StatusEnum as ValidStatus
} from "../../../../../../definitions/eu_covid_cert/ValidCertificate";
import { Mime_typeEnum } from "../../../../../../definitions/eu_covid_cert/QRCode";
import { getGenericError } from "../../../../../utils/errors";

const revokedCertificate: RevokedCertificate = {
  id: "revokedCertificateId",
  status: StatusEnum.revoked,
  revoke_reason: "the revoked reason",
  revoked_on: new Date()
};

const validCertificate: ValidCertificate = {
  id: "validCertificateId",
  status: ValidStatus.valid,
  info: "## info markdown",
  detail: "## detail markdown",
  qr_code: {
    mime_type: Mime_typeEnum["image/png"],
    content: "iVBOw"
  }
};

const authCode = "123" as EUCovidCertificateAuthCode;
const requestAction = euCovidCertificateGet.request(authCode);

const cases: ReadonlyArray<[
  apiResponse: Either<Error, { status: number; value?: Certificate }>,
  expectedAction:
    | ActionType<typeof euCovidCertificateGet.success>
    | ActionType<typeof euCovidCertificateGet.failure>
]> = [
  [
    right({ status: 200, value: revokedCertificate }),
    euCovidCertificateGet.success({
      kind: "success",
      value: {
        kind: "revoked",
        id: revokedCertificate.id as EUCovidCertificate["id"],
        revokedOn: revokedCertificate.revoked_on
      },
      authCode
    })
  ],
  [
    right({ status: 200, value: validCertificate }),
    euCovidCertificateGet.success({
      kind: "success",
      value: {
        kind: "valid",
        id: validCertificate.id as EUCovidCertificate["id"],
        qrCode: {
          mimeType: validCertificate.qr_code.mime_type,
          content: validCertificate.qr_code.content
        },
        markdownPreview: validCertificate.info,
        markdownDetails: validCertificate.detail
      },
      authCode
    })
  ],
  [
    right({ status: 401 }),
    euCovidCertificateGet.success({ kind: "genericError", authCode })
  ],
  [
    right({ status: 600 }), // unexpected code
    euCovidCertificateGet.success({ kind: "genericError", authCode })
  ],
  [
    right({ status: 400 }),
    euCovidCertificateGet.success({ kind: "wrongFormat", authCode })
  ],
  [
    right({ status: 403 }),
    euCovidCertificateGet.success({ kind: "notFound", authCode })
  ],
  [
    right({ status: 410 }),
    euCovidCertificateGet.success({ kind: "notOperational", authCode })
  ],
  [
    right({ status: 500 }),
    euCovidCertificateGet.success({ kind: "genericError", authCode })
  ],
  [
    right({ status: 504 }),
    euCovidCertificateGet.success({ kind: "temporarilyNotAvailable", authCode })
  ],
  [
    left(new Error("cant parse")),
    euCovidCertificateGet.failure({
      ...getGenericError(new Error("cant parse")),
      authCode
    })
  ]
];

describe("handleGetEuCovidCertificate selector", () => {
  test.each(cases)(
    "given %p as argument, returns %p",
    (apiResponse, expectedAction) => {
      const getCertificate = jest.fn();
      // mock the API response
      getCertificate.mockImplementation(() => apiResponse);
      void expectSaga(
        handleGetEuCovidCertificate,
        getCertificate,
        requestAction
      )
        .withReducer(appReducer)
        // the saga should dispatch the expected action
        .put(expectedAction)
        .run();
    }
  );
});
