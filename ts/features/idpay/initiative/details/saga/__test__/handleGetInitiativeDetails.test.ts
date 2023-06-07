import * as E from "fp-ts/lib/Either";
import { expectSaga } from "redux-saga-test-plan";
import { PreferredLanguageEnum } from "../../../../../../../definitions/backend/PreferredLanguage";
import {
  InitiativeDTO,
  StatusEnum
} from "../../../../../../../definitions/idpay/InitiativeDTO";
import { appReducer } from "../../../../../../store/reducers";
import { idpayInitiativeGet } from "../../store/actions";
import { handleGetInitiativeDetails } from "../handleGetInitiativeDetails";
import { ErrorDTO } from "../../../../../../../definitions/idpay/ErrorDTO";

const mockResponseSuccess: InitiativeDTO = {
  initiativeId: "123",
  status: StatusEnum.REFUNDABLE,
  endDate: new Date(),
  nInstr: 123
};

const mockFailure: ErrorDTO = {
  code: "403",
  message: "message"
};
const mockToken = "mock";
const mockLanguage = PreferredLanguageEnum.it_IT;

describe("Test IDPay initiative details saga", () => {
  it("should call the success handler on success", async () => {
    const getWallet = jest.fn();
    getWallet.mockImplementation(() =>
      E.right({ status: 200, value: mockResponseSuccess })
    );

    await expectSaga(
      handleGetInitiativeDetails,
      getWallet,
      mockToken,
      mockLanguage,
      { initiativeId: "123" }
    )
      .withReducer(appReducer)
      .put(idpayInitiativeGet.success(mockResponseSuccess))
      .run();
  });
  it("should call the failure handler on failure", async () => {
    const getWallet = jest.fn();
    getWallet.mockImplementation(() =>
      E.right({ status: 401, value: mockFailure })
    );

    await expectSaga(
      handleGetInitiativeDetails,
      getWallet,
      mockToken,
      mockLanguage,
      { initiativeId: "123" }
    )
      .withReducer(appReducer)
      .put(
        idpayInitiativeGet.failure({
          kind: "generic",
          value: new Error("response status code 401")
        })
      )
      .run();
  });
  it("should behave gracefully when the client throws an error", async () => {
    const getWallet = jest.fn();
    getWallet.mockImplementation(() => E.left([]));

    await expectSaga(
      handleGetInitiativeDetails,
      getWallet,
      mockToken,
      mockLanguage,
      { initiativeId: "123" }
    )
      .withReducer(appReducer)
      .put(
        idpayInitiativeGet.failure({
          kind: "generic",
          value: new Error("")
        })
      )
      .run();
  });
});
