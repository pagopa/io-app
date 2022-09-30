import * as E from "fp-ts/lib/Either";
import { expectSaga } from "redux-saga-test-plan";
import { ActionType } from "typesafe-actions";
import { Certificate } from "../../../../../../definitions/eu_covid_cert/Certificate";
import {
  convertHeaderInfo,
  handleGetEuCovidCertificate
} from "../handleGetEuCovidCertificate";
import { appReducer } from "../../../../../store/reducers";
import { euCovidCertificateGet } from "../../../store/actions";
import {
  EUCovidCertificate,
  EUCovidCertificateAuthCode
} from "../../../types/EUCovidCertificate";
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
import {
  ExpiredCertificate,
  StatusEnum as ExpiredStatus
} from "../../../../../../definitions/eu_covid_cert/ExpiredCertificate";

const header_info = {
  title: "title",
  subtitle: "sub title",
  logo_id: "logo id"
};

const revokedCertificate: RevokedCertificate = {
  uvci: "revokedCertificateId",
  status: StatusEnum.revoked,
  info: "the revoked reason",
  revoked_on: new Date(),
  header_info
};

const expiredCertificate: ExpiredCertificate = {
  uvci: "expiredCertificateId",
  status: ExpiredStatus.expired,
  info: "the expired reason",
  header_info
};

const validCertificate: ValidCertificate = {
  uvci: "validCertificateId",
  status: ValidStatus.valid,
  info: "## info markdown",
  detail: "## detail markdown",
  qr_code: {
    mime_type: Mime_typeEnum["image/png"],
    content: "iVBOw"
  },
  header_info
};

const authCode = "123" as EUCovidCertificateAuthCode;
const requestAction = euCovidCertificateGet.request(authCode);

const cases: ReadonlyArray<
  [
    apiResponse: E.Either<Error, { status: number; value?: Certificate }>,
    expectedAction:
      | ActionType<typeof euCovidCertificateGet.success>
      | ActionType<typeof euCovidCertificateGet.failure>
  ]
> = [
  [
    E.right({ status: 200, value: revokedCertificate }),
    euCovidCertificateGet.success({
      kind: "success",
      value: {
        kind: "revoked",
        id: revokedCertificate.uvci as EUCovidCertificate["id"],
        revokedOn: revokedCertificate.revoked_on,
        headerData: convertHeaderInfo(header_info)
      },
      authCode
    })
  ],
  [
    E.right({ status: 200, value: expiredCertificate }),
    euCovidCertificateGet.success({
      kind: "success",
      value: {
        kind: "expired",
        id: expiredCertificate.uvci as EUCovidCertificate["id"],
        markdownInfo: expiredCertificate.info,
        headerData: convertHeaderInfo(header_info)
      },
      authCode
    })
  ],
  [
    E.right({ status: 200, value: validCertificate }),
    euCovidCertificateGet.success({
      kind: "success",
      value: {
        kind: "valid",
        id: validCertificate.uvci as EUCovidCertificate["id"],
        qrCode: {
          mimeType: validCertificate.qr_code.mime_type,
          content: validCertificate.qr_code.content
        },
        markdownInfo: validCertificate.info,
        markdownDetails: validCertificate.detail,
        headerData: convertHeaderInfo(header_info)
      },
      authCode
    })
  ],
  [
    E.right({
      status: 200,
      value: { kind: "strangeKind" } as unknown as Certificate
    }), // should not never happen
    euCovidCertificateGet.success({ kind: "wrongFormat", authCode })
  ],
  [
    E.right({ status: 401 }),
    euCovidCertificateGet.failure({
      ...getGenericError(new Error(`response status code 401`)),
      authCode
    })
  ],
  [
    E.right({ status: 600 }), // unexpected code
    euCovidCertificateGet.failure({
      ...getGenericError(new Error(`response status code 600`)),
      authCode
    })
  ],
  [
    E.right({ status: 400 }),
    euCovidCertificateGet.success({ kind: "wrongFormat", authCode })
  ],
  [
    E.right({ status: 403 }),
    euCovidCertificateGet.success({ kind: "notFound", authCode })
  ],
  [
    E.right({ status: 410 }),
    euCovidCertificateGet.success({ kind: "notOperational", authCode })
  ],
  [
    E.right({ status: 500 }),
    euCovidCertificateGet.failure({
      ...getGenericError(new Error(`response status code 500`)),
      authCode
    })
  ],
  [
    E.right({ status: 504 }),
    euCovidCertificateGet.success({ kind: "temporarilyNotAvailable", authCode })
  ],
  [
    E.left(new Error("cannot parse")),
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
