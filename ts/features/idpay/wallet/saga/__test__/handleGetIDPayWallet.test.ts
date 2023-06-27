import * as E from "fp-ts/lib/Either";
import { expectSaga } from "redux-saga-test-plan";
import { appReducer } from "../../../../../store/reducers";
import { idPayWalletGet } from "../../store/actions";
import { WalletDTO } from "../../../../../../definitions/idpay/WalletDTO";
import { ErrorDTO } from "../../../../../../definitions/idpay/ErrorDTO";
import { handleGetIDPayWallet } from "../handleGetIDPayWallet";
import { PreferredLanguageEnum } from "../../../../../../definitions/backend/PreferredLanguage";

const mockedWallet: WalletDTO = { initiativeList: [] };
const mockedError: ErrorDTO = { code: 204, message: "message" };
const mockToken = "mock";
const mockLanguage = PreferredLanguageEnum.it_IT;

describe("Test handleGetIDPayWallet selector", () => {
  it("should call the success action after successfull api call", async () => {
    const getWallet = jest.fn();
    getWallet.mockImplementation(() =>
      E.right({ status: 200, value: mockedWallet })
    );
    await expectSaga(handleGetIDPayWallet, getWallet, mockToken, mockLanguage)
      .withReducer(appReducer)
      .put(idPayWalletGet.success(mockedWallet))
      .run();
  });
  it("should call the failure action with a generic error after a 401 api call", async () => {
    const getWallet = jest.fn();
    getWallet.mockImplementation(() =>
      E.right({ status: 401, value: mockedError })
    );
    await expectSaga(handleGetIDPayWallet, getWallet, mockToken, mockLanguage)
      .withReducer(appReducer)
      .put(
        idPayWalletGet.failure({
          kind: "generic",
          value: new Error("response status code 401")
        })
      )
      .run();
  });
  it("should call the failure action with a generic error after a 429 api call", async () => {
    const getWallet = jest.fn();
    getWallet.mockImplementation(() =>
      E.right({ status: 429, value: mockedError })
    );
    await expectSaga(handleGetIDPayWallet, getWallet, mockToken, mockLanguage)
      .withReducer(appReducer)
      .put(
        idPayWalletGet.failure({
          kind: "generic",
          value: new Error("response status code 429")
        })
      )
      .run();
  });
  it("should call the failure action with a generic error after a 500 api call", async () => {
    const getWallet = jest.fn();
    getWallet.mockImplementation(() =>
      E.right({ status: 500, value: mockedError })
    );
    await expectSaga(handleGetIDPayWallet, getWallet, mockToken, mockLanguage)
      .withReducer(appReducer)
      .put(
        idPayWalletGet.failure({
          kind: "generic",
          value: new Error("response status code 500")
        })
      )
      .run();
  });
  it("should call the failure action with a network error after a network error", async () => {
    const getWallet = jest.fn();
    getWallet.mockImplementation(() => E.left([]));
    await expectSaga(handleGetIDPayWallet, getWallet, mockToken, mockLanguage)
      .withReducer(appReducer)
      .put(
        idPayWalletGet.failure({
          kind: "generic",
          value: new Error("")
        })
      )
      .run();
  });
});
