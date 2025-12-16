import * as E from "fp-ts/lib/Either";
import { testSaga } from "redux-saga-test-plan";
import { getType } from "typesafe-actions";
import { PreferredLanguageEnum } from "../../../../../../definitions/backend/PreferredLanguage";
import { TimelineDTO } from "../../../../../../definitions/idpay/TimelineDTO";
import {
  OperationTypeEnum,
  StatusEnum
} from "../../../../../../definitions/idpay/TransactionOperationDTO";
import { withRefreshApiCall } from "../../../../authentication/fastLogin/saga/utils";
import { idpayTimelinePageGet } from "../../store/actions";
import { handleGetTimelinePage } from "../handleGetTimelinePage";
import { OperationDTO } from "../../../../../../definitions/idpay/OperationDTO";

const mockResponseSuccess = {
  // mock TimelineDTO
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

describe("idpayTimelinePageGet", () => {
  const initiativeId = "abcdef";

  describe("when the response is successful", () => {
    it(`should put ${getType(
      idpayTimelinePageGet.success
    )} with the timeline and page number`, () => {
      const getTimeline = jest.fn();
      testSaga(
        handleGetTimelinePage,
        getTimeline,
        "bpdToken",
        PreferredLanguageEnum.it_IT,
        idpayTimelinePageGet.request({ initiativeId, page: 1, pageSize: 10 })
      )
        .next()
        .call(
          withRefreshApiCall,
          getTimeline({ initiativeId, page: 1, size: 10 }),
          idpayTimelinePageGet.request({ initiativeId, page: 1, pageSize: 10 })
        )
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
  });

  describe("when the response is an Error", () => {
    const statusCode = 500;

    it(`should put ${getType(
      idpayTimelinePageGet.failure
    )} with the error`, () => {
      const getTimeline = jest.fn();
      testSaga(
        handleGetTimelinePage,
        getTimeline,
        "bpdToken",
        PreferredLanguageEnum.it_IT,
        idpayTimelinePageGet.request({ initiativeId, page: 1, pageSize: 10 })
      )
        .next()
        .call(
          withRefreshApiCall,
          getTimeline({ initiativeId, page: 1, size: 10 }),
          idpayTimelinePageGet.request({ initiativeId, page: 1, pageSize: 10 })
        )
        .next(
          E.right({
            status: statusCode,
            value: { code: statusCode, message: "error" }
          })
        )
        .put(
          idpayTimelinePageGet.failure({
            kind: "generic",
            value: new Error(`response status code ${statusCode}`)
          })
        )
        .next()
        .isDone();
    });
  });
});
