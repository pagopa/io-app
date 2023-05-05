import * as pot from "@pagopa/ts-commons/lib/pot";
import { createStore } from "redux";
import {
  idPayAreInitiativesFromInstrumentLoadingSelector,
  idPayEnabledInitiativesFromInstrumentSelector,
  idPayInitiativeAwaitingUpdateSelector,
  idPayInitiativesFromInstrumentSelector,
  idPayWalletInitiativeListSelector,
  idPayWalletSelector
} from "..";
import { InitiativesWithInstrumentDTO } from "../../../../../../../definitions/idpay/InitiativesWithInstrumentDTO";
import { WalletDTO } from "../../../../../../../definitions/idpay/WalletDTO";
import { applicationChangeState } from "../../../../../../store/actions/application";
import { appReducer } from "../../../../../../store/reducers";
import { isIdPayEnabledSelector } from "../../../../../../store/reducers/backendStatus";
import { NetworkError } from "../../../../../../utils/errors";
import {
  idPayInitiativesFromInstrumentGet,
  idPayWalletGet,
  idpayInitiativesInstrumentDelete,
  idpayInitiativesInstrumentEnroll
} from "../../actions";

const mockResponseSuccess: WalletDTO = {
  initiativeList: []
};

const mockInitiativesWithInstrumentSuccess: InitiativesWithInstrumentDTO = {
  initiativeList: [],
  brand: "MASTERCARD",
  idWallet: "1234567890",
  maskedPan: "************1234"
};

const mockFailure: NetworkError = {
  kind: "generic",
  value: new Error("response status code 401")
};

describe("Test IDPay wallet/initiatives reducers and selectors", () => {
  it("should be pot.none before the first loading action", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    expect(globalState.features.idPay.wallet.initiatives).toStrictEqual(
      pot.none
    );
    expect(idPayWalletSelector(globalState)).toStrictEqual(pot.none);
    expect(idPayWalletInitiativeListSelector(globalState)).toStrictEqual(
      pot.none
    );
  });
  it("should be pot.noneLoading after the first loading action dispatched", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(idPayWalletGet.request());
    expect(store.getState().features.idPay.wallet.initiatives).toStrictEqual(
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
    expect(store.getState().features.idPay.wallet.initiatives).toStrictEqual(
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
    expect(store.getState().features.idPay.wallet.initiatives).toStrictEqual(
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

describe("test Idpay InitiativesFromInstrument reducers and selectors", () => {
  it("resets the queue and sets the initiatives to loading on a non-refresh call", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(
      idPayInitiativesFromInstrumentGet.request({
        idWallet: "MOCK"
      })
    );
    store.dispatch(
      idPayInitiativesFromInstrumentGet.success(
        mockInitiativesWithInstrumentSuccess
      )
    );
    store.dispatch(
      idPayInitiativesFromInstrumentGet.request({
        idWallet: "MOCK",
        isRefreshCall: false
      })
    );
    const isIdpayEnabled = isIdPayEnabledSelector(store.getState());
    expect(
      store.getState().features.idPay.wallet.initiativesAwaitingStatusUpdate
    ).toStrictEqual({});
    expect(
      idPayAreInitiativesFromInstrumentLoadingSelector(store.getState())
      // we expect it to be true, but is false in case idpay is disabled
    ).toStrictEqual(isIdpayEnabled);
    expect(
      idPayEnabledInitiativesFromInstrumentSelector(store.getState())
    ).toStrictEqual([]);
    expect(
      idPayInitiativesFromInstrumentSelector(store.getState())
    ).toStrictEqual(pot.noneLoading);
  });
  it("does not reset the queue or set the initiatives to loading on a refresh call", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(
      idPayInitiativesFromInstrumentGet.request({
        idWallet: "MOCK",
        isRefreshCall: false
      })
    );
    store.dispatch(
      idPayInitiativesFromInstrumentGet.success(
        mockInitiativesWithInstrumentSuccess
      )
    );
    store.dispatch(
      idpayInitiativesInstrumentEnroll.request({
        idWallet: "MOCK",
        initiativeId: "MOCK"
      })
    );
    store.dispatch(
      idPayInitiativesFromInstrumentGet.request({
        idWallet: "MOCK",
        isRefreshCall: true
      })
    );
    expect(
      store.getState().features.idPay.wallet.initiativesAwaitingStatusUpdate
    ).toStrictEqual({ MOCK: true });
    expect(
      store.getState().features.idPay.wallet.initiativesWithInstrument
    ).toStrictEqual(pot.some(mockInitiativesWithInstrumentSuccess));
    expect(
      idPayEnabledInitiativesFromInstrumentSelector(store.getState())
    ).toStrictEqual(mockInitiativesWithInstrumentSuccess.initiativeList);
    expect(
      idPayInitiativesFromInstrumentSelector(store.getState())
    ).toStrictEqual(pot.some(mockInitiativesWithInstrumentSuccess));
  });
});

describe("test Idpay Initiative Enroll/Delete reducers and selectors", () => {
  it("adds the initiative to the data structure when enrolling", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(
      idpayInitiativesInstrumentEnroll.request({
        idWallet: "MOCK",
        initiativeId: "initiative"
      })
    );
    store.dispatch(
      idpayInitiativesInstrumentEnroll.request({
        idWallet: "MOCK1",
        initiativeId: "initiative1"
      })
    );
    store.dispatch(
      idpayInitiativesInstrumentDelete.request({
        instrumentId: "MOCK2",
        initiativeId: "initiative2"
      })
    );
    expect(
      store.getState().features.idPay.wallet.initiativesAwaitingStatusUpdate
    ).toStrictEqual({ initiative: true, initiative1: true, initiative2: true });
    expect(
      idPayEnabledInitiativesFromInstrumentSelector(store.getState())
    ).toStrictEqual(mockInitiativesWithInstrumentSuccess.initiativeList);
    expect(
      idPayInitiativeAwaitingUpdateSelector(store.getState(), "initiative") &&
        idPayInitiativeAwaitingUpdateSelector(
          store.getState(),
          "initiative1"
        ) &&
        idPayInitiativeAwaitingUpdateSelector(store.getState(), "initiative2")
    ).toStrictEqual(true);
  });
});
