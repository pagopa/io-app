import * as pot from "@pagopa/ts-commons/lib/pot";
import { createStore } from "redux";
import { idPayWalletInitiativeListSelector, idPayWalletSelector } from "..";
import { WalletDTO } from "../../../../../../../definitions/idpay/WalletDTO";
import { applicationChangeState } from "../../../../../../store/actions/application";
import { appReducer } from "../../../../../../store/reducers";
import { NetworkError } from "../../../../../../utils/errors";
import { idPayWalletGet } from "../../actions";

const mockResponseSuccess: WalletDTO = {
  initiativeList: []
};

const mockFailure: NetworkError = {
  kind: "generic",
  value: new Error("response status code 401")
};

describe("Test IDPay wallet reducers and selectors", () => {
  it("should be pot.none before the first loading action", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    expect(globalState.features.idPay.wallet).toStrictEqual(pot.none);
    expect(idPayWalletSelector(globalState)).toStrictEqual(pot.none);
    expect(idPayWalletInitiativeListSelector(globalState)).toStrictEqual(
      pot.none
    );
  });
  it("should be pot.noneLoading after the first loading action dispatched", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(idPayWalletGet.request());
    expect(store.getState().features.idPay.wallet).toStrictEqual(
      pot.noneLoading
    );
    expect(idPayWalletSelector(store.getState())).toStrictEqual(
      pot.noneLoading
    );
    expect(idPayWalletInitiativeListSelector(store.getState())).toStrictEqual(
      pot.noneLoading
    );
  });
  it("should be pot.some with the response, after the success action", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(idPayWalletGet.request());
    store.dispatch(idPayWalletGet.success(mockResponseSuccess));
    expect(store.getState().features.idPay.wallet).toStrictEqual(
      pot.some(mockResponseSuccess)
    );
    expect(idPayWalletSelector(store.getState())).toStrictEqual(
      pot.some(mockResponseSuccess)
    );
    expect(idPayWalletInitiativeListSelector(store.getState())).toStrictEqual(
      pot.some(mockResponseSuccess.initiativeList)
    );
  });
  it("should be pot.noneError with the error, after the failure action", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(idPayWalletGet.request());
    store.dispatch(idPayWalletGet.failure(mockFailure));
    expect(store.getState().features.idPay.wallet).toStrictEqual(
      pot.noneError(mockFailure)
    );
    expect(idPayWalletSelector(store.getState())).toStrictEqual(
      pot.noneError(mockFailure)
    );
    expect(idPayWalletInitiativeListSelector(store.getState())).toStrictEqual(
      pot.noneError(mockFailure)
    );
  });
});
