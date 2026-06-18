import * as pot from "@pagopa/ts-commons/lib/pot";
import { createStore } from "redux";
import {
  idPayAreInitiativesFromInstrumentLoadingSelector,
  idPayEnabledInitiativesFromInstrumentSelector,
  idPayInitiativesAwaitingUpdateSelector,
  idPayInitiativesFromInstrumentSelector,
  idPayWalletInitiativeListSelector
} from "..";
import { InitiativesWithInstrumentDTO } from "../../../../../../../definitions/idpay/InitiativesWithInstrumentDTO";
import { WalletDTO } from "../../../../../../../definitions/idpay/WalletDTO";
import { applicationChangeState } from "../../../../../../store/actions/application";
import { appReducer } from "../../../../../../store/reducers";
import { isIdPayEnabledSelector } from "../../../../../../store/reducers/backendStatus/remoteConfig";
import { NetworkError } from "../../../../../../utils/errors";
import {
  idPayInitiativesFromInstrumentGet,
  idPayWalletGet,
  idpayInitiativesInstrumentDelete,
  idpayInitiativesInstrumentEnroll
} from "../../actions";
import { GlobalState } from "../../../../../../store/reducers/types";

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

  it("set the initiatives to updating on a refresh call", () => {
    const globalState = appReducer(
      undefined,
      applicationChangeState("active")
    ) as GlobalState;

    const state: GlobalState = {
      ...globalState,
      features: {
        ...globalState.features,
        idPay: {
          ...globalState.features.idPay,
          wallet: {
            ...globalState.features.idPay.wallet,
            initiativesWithInstrument: pot.some(
              mockInitiativesWithInstrumentSuccess
            )
          }
        }
      }
    };

    const store = createStore(appReducer, state as any);
    store.dispatch(
      idPayInitiativesFromInstrumentGet.request({
        idWallet: "MOCK",
        isRefreshing: true
      })
    );

    expect(
      store.getState().features.idPay.wallet.initiativesWithInstrument
    ).toStrictEqual(
      pot.someUpdating(
        mockInitiativesWithInstrumentSuccess,
        mockInitiativesWithInstrumentSuccess
      )
    );

    expect(
      idPayEnabledInitiativesFromInstrumentSelector(store.getState())
    ).toStrictEqual(mockInitiativesWithInstrumentSuccess.initiativeList);

    expect(
      idPayInitiativesFromInstrumentSelector(store.getState())
    ).toStrictEqual(
      pot.someUpdating(
        mockInitiativesWithInstrumentSuccess,
        mockInitiativesWithInstrumentSuccess
      )
    );
  });

  it("sets the initiatives to some on success", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(
      idPayInitiativesFromInstrumentGet.success(
        mockInitiativesWithInstrumentSuccess
      )
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
    ).toStrictEqual(pot.some(mockInitiativesWithInstrumentSuccess));
  });
});

describe("test Idpay Initiative Enroll/Delete reducers and selectors", () => {
  it("adds the initiative to the data structure when enrolling", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);

    const T_INITIATIVE_ID_1 = "initiative1";
    const T_INITIATIVE_ID_2 = "initiative2";
    const T_INITIATIVE_ID_3 = "initiative3";

    store.dispatch(
      idpayInitiativesInstrumentEnroll.request({
        idWallet: "MOCK",
        initiativeId: T_INITIATIVE_ID_1
      })
    );
    store.dispatch(
      idpayInitiativesInstrumentEnroll.request({
        idWallet: "MOCK1",
        initiativeId: T_INITIATIVE_ID_2
      })
    );
    store.dispatch(
      idpayInitiativesInstrumentDelete.request({
        instrumentId: "MOCK2",
        initiativeId: T_INITIATIVE_ID_3
      })
    );
    expect(
      store.getState().features.idPay.wallet.initiativesAwaitingStatusUpdate
    ).toStrictEqual({
      [T_INITIATIVE_ID_1]: true,
      [T_INITIATIVE_ID_2]: true,
      [T_INITIATIVE_ID_3]: true
    });
    expect(
      idPayEnabledInitiativesFromInstrumentSelector(store.getState())
    ).toStrictEqual(mockInitiativesWithInstrumentSuccess.initiativeList);
    expect(
      idPayInitiativesAwaitingUpdateSelector(store.getState())[
        T_INITIATIVE_ID_1
      ] &&
        idPayInitiativesAwaitingUpdateSelector(store.getState())[
          T_INITIATIVE_ID_2
        ] &&
        idPayInitiativesAwaitingUpdateSelector(store.getState())[
          T_INITIATIVE_ID_3
        ]
    ).toStrictEqual(true);
  });
});
