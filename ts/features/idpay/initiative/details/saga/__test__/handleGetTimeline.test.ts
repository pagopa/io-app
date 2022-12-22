import * as E from "fp-ts/lib/Either";
import { expectSaga } from "redux-saga-test-plan";
import { PreferredLanguageEnum } from "../../../../../../../definitions/backend/PreferredLanguage";
import { ErrorDTO } from "../../../../../../../definitions/idpay/timeline/ErrorDTO";
import { TimelineDTO } from "../../../../../../../definitions/idpay/timeline/TimelineDTO";
import { OperationTypeEnum } from "../../../../../../../definitions/idpay/timeline/TransactionOperationDTO";
import { appReducer } from "../../../../../../store/reducers";
import { idpayTimelineGet } from "../../store/actions";
import { handleGetTimeline } from "../handleGetTimeline";

const mockResponseSuccess: TimelineDTO = {
  // mock TimelineDTO
  lastUpdate: new Date("2020-05-20T09:00:00.000Z"),
  operationList: [
    {
      operationId: "1234567890",
      operationType: OperationTypeEnum.TRANSACTION,
      operationDate: new Date("2020-05-20T09:00:00.000Z"),
      amount: 100,
      brandLogo: "https://www.google.com",
      maskedPan: "1234567890",
      circuitType: "MASTERCARD"
    }
  ]
};
const mockFailure: ErrorDTO = {
  code: 0,
  message: "message"
};
const mockToken = "mock";
const mockLanguage = PreferredLanguageEnum.it_IT;

describe("Test IDPay timeline saga", () => {
  it("should call the success handler on success", async () => {
    const getTimeline = jest.fn();
    getTimeline.mockImplementation(() =>
      E.right({ status: 200, value: mockResponseSuccess })
    );

    await expectSaga(handleGetTimeline, getTimeline, mockToken, mockLanguage, {
      initiativeId: "123"
    })
      .withReducer(appReducer)
      .put(idpayTimelineGet.success(mockResponseSuccess))
      .run();
  });
  it("should call the failure handler on failure", async () => {
    const getTimeline = jest.fn();
    getTimeline.mockImplementation(() =>
      E.right({ status: 401, value: mockFailure })
    );

    await expectSaga(handleGetTimeline, getTimeline, mockToken, mockLanguage, {
      initiativeId: "123"
    })
      .withReducer(appReducer)
      .put(
        idpayTimelineGet.failure({
          kind: "generic",
          value: new Error("response status code 401")
        })
      )
      .run();
  });
  it('should behave gracefully on "generic" error', async () => {
    const getTimeline = jest.fn();
    getTimeline.mockImplementation(() => E.left([]));

    await expectSaga(handleGetTimeline, getTimeline, mockToken, mockLanguage, {
      initiativeId: "123"
    })
      .withReducer(appReducer)
      .put(
        idpayTimelineGet.failure({
          kind: "generic",
          value: new Error("")
        })
      )
      .run();
  });
});
