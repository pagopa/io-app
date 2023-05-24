import * as E from "fp-ts/lib/Either";
import { expectSaga } from "redux-saga-test-plan";
import { PreferredLanguageEnum } from "../../../../../../../definitions/backend/PreferredLanguage";
import { OperationDTO } from "../../../../../../../definitions/idpay/OperationDTO";
import { OperationTypeEnum as TransactionOperationType } from "../../../../../../../definitions/idpay/TransactionOperationDTO";
import { appReducer } from "../../../../../../store/reducers";
import { handleGetTimelineDetails } from "../handleGetTimelineDetails";
import { idpayTimelineDetailsGet } from "../../store/actions";

const mockResponseSuccess: OperationDTO = {
  operationType: TransactionOperationType.TRANSACTION,
  brand: "VISA",
  operationDate: new Date(),
  amount: 100.34,
  brandLogo:
    "https://uat.wisp2.pagopa.gov.it/wallet/assets/img/creditcard/carta_visa.png",
  circuitType: "01",
  maskedPan: "1234",
  operationId: "1",
  accrued: 100.0,
  idTrxAcquirer: "1",
  idTrxIssuer: "1",
  status: ""
};
const mockToken = "mock";
const mockLanguage = PreferredLanguageEnum.it_IT;
const mockPayload = { initiativeId: "123", operationId: "123" };

describe("Test IDPay timeline details saga", () => {
  it("should call the success handler on success", async () => {
    const getTimelineDetails = jest.fn();
    getTimelineDetails.mockImplementation(() =>
      E.right({ status: 200, value: mockResponseSuccess })
    );

    await expectSaga(
      handleGetTimelineDetails,
      getTimelineDetails,
      mockToken,
      mockLanguage,
      mockPayload
    )
      .withReducer(appReducer)
      .put(idpayTimelineDetailsGet.success(mockResponseSuccess))
      .run();
  });

  it("should call the failure handler on failure", async () => {
    const getTimelineDetails = jest.fn();
    getTimelineDetails.mockImplementation(() =>
      E.right({ status: 401, value: "error" })
    );

    await expectSaga(
      handleGetTimelineDetails,
      getTimelineDetails,
      mockToken,
      mockLanguage,
      mockPayload
    )
      .withReducer(appReducer)
      .put(
        idpayTimelineDetailsGet.failure({
          kind: "generic",
          value: new Error("response status code 401")
        })
      )
      .run();
  });

  it("should call the failure handler on error", async () => {
    const getTimelineDetails = jest.fn();
    getTimelineDetails.mockImplementation(() => E.left([]));

    await expectSaga(
      handleGetTimelineDetails,
      getTimelineDetails,
      mockToken,
      mockLanguage,
      mockPayload
    )
      .withReducer(appReducer)
      .put(
        idpayTimelineDetailsGet.failure({
          kind: "generic",
          value: new Error("")
        })
      )
      .run();
  });
});
