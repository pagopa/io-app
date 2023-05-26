import * as E from "fp-ts/lib/Either";
import { expectSaga } from "redux-saga-test-plan";
import { PreferredLanguageEnum } from "../../../../../../../definitions/backend/PreferredLanguage";
import { ErrorDTO } from "../../../../../../../definitions/idpay/ErrorDTO";
import { TimelineDTO } from "../../../../../../../definitions/idpay/TimelineDTO";
import {
  OperationTypeEnum,
  StatusEnum
} from "../../../../../../../definitions/idpay/TransactionOperationDTO";
import { appReducer } from "../../../../../../store/reducers";
import { idpayTimelinePageGet } from "../../store/actions";
import { handleGetTimelinePage } from "../handleGetTimelinePage";

const mockResponseSuccess: TimelineDTO = {
  // mock TimelineDTO
  lastUpdate: new Date("2020-05-20T09:00:00.000Z"),
  operationList: [
    {
      brand: "VISA",
      accrued: 50,
      operationId: "1234567890",
      operationType: OperationTypeEnum.TRANSACTION,
      operationDate: new Date("2020-05-20T09:00:00.000Z"),
      amount: 100,
      brandLogo: "https://www.google.com",
      maskedPan: "1234567890",
      circuitType: "MASTERCARD",
      status: StatusEnum.AUTHORIZED
    }
  ],
  pageNo: 0,
  pageSize: 10,
  totalElements: 1,
  totalPages: 1
};
const mockFailure: ErrorDTO = {
  code: 0,
  message: "message"
};
const mockToken = "mock";
const mockLanguage = PreferredLanguageEnum.it_IT;

describe("Test IDPay timeline pagination saga", () => {
  it("should call the success handler on success", async () => {
    const getTimeline = jest.fn();
    getTimeline.mockImplementation(() =>
      E.right({ status: 200, value: mockResponseSuccess })
    );
    await expectSaga(
      handleGetTimelinePage,
      getTimeline,
      mockToken,
      mockLanguage,
      {
        initiativeId: "123",
        page: 0
      }
    )
      .withReducer(appReducer)
      .put(
        idpayTimelinePageGet.success({ timeline: mockResponseSuccess, page: 0 })
      )
      .run();
  });
  it("should call the failure handler on failure", async () => {
    const getTimeline = jest.fn();
    getTimeline.mockImplementation(() =>
      E.right({ status: 401, value: mockFailure })
    );
    await expectSaga(
      handleGetTimelinePage,
      getTimeline,
      mockToken,
      mockLanguage,
      {
        initiativeId: "123",
        page: 5
      }
    )
      .withReducer(appReducer)
      .put(
        idpayTimelinePageGet.failure({
          kind: "generic",
          value: new Error("401")
        })
      )
      .run();
  });
});
