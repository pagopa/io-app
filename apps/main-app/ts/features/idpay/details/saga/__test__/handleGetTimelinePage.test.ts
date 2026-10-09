import { PreferredLanguageEnum } from "@io-app/api-types/generated/definitions/identity/PreferredLanguage";
import { OperationDTO } from "@io-app/api-types/generated/definitions/idpay/OperationDTO";
import { TimelineDTO } from "@io-app/api-types/generated/definitions/idpay/TimelineDTO";
import {
  OperationTypeEnum,
  StatusEnum
} from "@io-app/api-types/generated/definitions/idpay/TransactionOperationDTO";
import * as E from "fp-ts/lib/Either";
import { testSaga } from "redux-saga-test-plan";
import { getType } from "typesafe-actions";

import {
  FailureReason,
  FailureReasonError
} from "../../../../../utils/failureReason";
import { readablePrivacyReport } from "../../../../../utils/reporters";
import { withRefreshApiCall } from "../../../../authentication/fastLogin/saga/utils";
import { idpayTimelinePageGet } from "../../store/actions";
import { handleGetTimelinePage } from "../handleGetTimelinePage";

const initiativeId = "abcdef";
const requestAction = idpayTimelinePageGet.request({
  initiativeId,
  page: 1,
  pageSize: 10
});

const mockResponseSuccess = {
  lastUpdate: new Date("2020-05-20T09:00:00.000Z"),
  operationList: [
    {
      brand: "VISA",
      accruedCents: 50,
      operationId: "1234567890",
      operationType: OperationTypeEnum.TRANSACTION,
      operationDate: new Date("2020-05-20T09:00:00.000Z"),
      amountCents: 100,
      brandLogo: "https://www.google.com",
      maskedPan: "1234567890",
      circuitType: "MASTERCARD",
      status: StatusEnum.AUTHORIZED
    } as OperationDTO
  ] as ReadonlyArray<OperationDTO>,
  pageNo: 1,
  pageSize: 10,
  totalElements: 1,
  totalPages: 1
} as TimelineDTO;

const validationErrors = [
  { value: 11, context: [{ key: "totalElements", type: {} as never }] }
];

const startSaga = () => {
  const getTimeline = jest.fn();
  return testSaga(
    handleGetTimelinePage,
    getTimeline,
    "bpdToken",
    PreferredLanguageEnum.it_IT,
    requestAction
  )
    .next()
    .call(
      withRefreshApiCall,
      getTimeline({ initiativeId, page: 1, size: 10 }),
      requestAction
    );
};

describe("handleGetTimelinePage", () => {
  it(`should put ${getType(
    idpayTimelinePageGet.success
  )} with the timeline and page number`, () => {
    startSaga()
      .next(E.right({ status: 200, value: mockResponseSuccess }))
      .put(
        idpayTimelinePageGet.success({
          timeline: mockResponseSuccess,
          page: mockResponseSuccess.pageNo
        })
      )
      .next()
      .isDone();
  });

  it(`should put ${getType(
    idpayTimelinePageGet.failure
  )} with a DECODE_ERROR when the response cannot be decoded`, () => {
    startSaga()
      .next(E.left(validationErrors))
      .put(
        idpayTimelinePageGet.failure({
          initiativeId,
          error: {
            kind: "generic",
            value: new FailureReasonError(
              FailureReason.DECODE_ERROR,
              readablePrivacyReport(validationErrors)
            )
          }
        })
      )
      .next()
      .isDone();
  });

  it.each([
    { name: "500", status: 500, reason: FailureReason.HTTP_STATUS_ERROR },
    { name: "401", status: 401, reason: FailureReason.SESSION_EXPIRED },
    { name: "429", status: 429, reason: FailureReason.RATE_LIMITED }
  ])(
    `should put ${getType(
      idpayTimelinePageGet.failure
    )} with a $reason on status $name`,
    ({ status, reason }) => {
      startSaga()
        .next(E.right({ status, value: { code: status, message: "error" } }))
        .put(
          idpayTimelinePageGet.failure({
            initiativeId,
            error: {
              kind: "generic",
              value: new FailureReasonError(
                reason,
                `response status code ${status}`
              )
            }
          })
        )
        .next()
        .isDone();
    }
  );

  it(`should put ${getType(
    idpayTimelinePageGet.failure
  )} with a timeout when the request exceeds the retries`, () => {
    startSaga()
      .throw(new Error("max-retries"))
      .put(
        idpayTimelinePageGet.failure({
          initiativeId,
          error: { kind: "timeout" }
        })
      )
      .next()
      .isDone();
  });
});
