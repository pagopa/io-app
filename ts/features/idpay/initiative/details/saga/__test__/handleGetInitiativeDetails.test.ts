import * as E from "fp-ts/lib/Either";
import { expectSaga } from "redux-saga-test-plan";
import { PreferredLanguageEnum } from "../../../../../../../definitions/backend/PreferredLanguage";
import {
  InitiativeDTO,
  StatusEnum
} from "../../../../../../../definitions/idpay/wallet/InitiativeDTO";
import { appReducer } from "../../../../../../store/reducers";
import { NetworkError } from "../../../../../../utils/errors";
import { idpayInitiativeGet } from "../../store";
import { handleGetInitiativeDetails } from "../handleGetInitiativeDetails";

const mockResponseSuccess: InitiativeDTO = {
  initiativeId: "123",
  status: StatusEnum.REFUNDABLE,
  endDate: new Date(),
  nInstr: 123
};

const mockFailure: NetworkError = {
  kind: "generic",
  value: new Error("response status code 401")
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
    getWallet.mockImplementation(() => E.left(mockFailure));

    await expectSaga(
      handleGetInitiativeDetails,
      getWallet,
      mockToken,
      mockLanguage,
      { initiativeId: "123" }
    )
      .withReducer(appReducer)
      .put(idpayInitiativeGet.failure(mockFailure))
      .run();
  });
  it("should be callable more than once", async () => {
    const getWallet = jest.fn();
    getWallet.mockImplementation(props =>
      E.right({
        status: 200,
        value: { ...mockResponseSuccess, initiativeId: props.initiativeId }
      })
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

    await expectSaga(
      handleGetInitiativeDetails,
      getWallet,
      mockToken,
      mockLanguage,
      { initiativeId: "213" }
    )
      .withReducer(appReducer)
      .put(
        idpayInitiativeGet.success({
          ...mockResponseSuccess,
          initiativeId: "213"
        })
      )
      .run();
  });
});
