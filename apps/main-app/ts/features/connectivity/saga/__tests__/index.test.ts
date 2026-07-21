import * as E from "fp-ts/lib/Either";
import { testSaga } from "redux-saga-test-plan";

import { apiUrlPrefix } from "../../../../config";
import { updateMixpanelSuperProperties } from "../../../../mixpanelConfig/superProperties";
import { appCurrentStateSelector } from "../../../../store/reducers/appState";
import { createConnectivityClient } from "../../api/client";
import { setConnectionStatus } from "../../store/actions";
import {
  connectionStatusSaga,
  default as connectivityRootSaga
} from "../index";

describe("connectionStatusSaga", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should set connection status to true and use success interval when net and backend are available", () => {
    const client = { getPing: jest.fn() } as any;
    const libraryResponse = E.right({ isConnected: true });
    const globalState = { any: "state" } as any;

    testSaga(connectionStatusSaga, client)
      .next()
      .select(appCurrentStateSelector)
      .next("active")
      .inspect(effect => {
        expect(effect).toMatchObject({ type: "CALL" });
      })
      .next(libraryResponse)
      .select(appCurrentStateSelector)
      .next("active")
      .inspect(effect => {
        expect(effect).toMatchObject({ type: "CALL" });
      })
      .next(true)
      .select(appCurrentStateSelector)
      .next("active")
      .put(setConnectionStatus(true))
      .next()
      .select()
      .next(globalState)
      .delay(30000)
      .next()
      .select(appCurrentStateSelector);

    expect(updateMixpanelSuperProperties).toHaveBeenCalledWith(globalState);
  });

  it("should set connection status to false and use failure interval when backend ping fails", () => {
    const client = { getPing: jest.fn() } as any;
    const libraryResponse = E.right({ isConnected: true });
    const globalState = { any: "state" } as any;

    testSaga(connectionStatusSaga, client)
      .next()
      .select(appCurrentStateSelector)
      .next("active")
      .inspect(effect => {
        expect(effect).toMatchObject({ type: "CALL" });
      })
      .next(libraryResponse)
      .select(appCurrentStateSelector)
      .next("active")
      .inspect(effect => {
        expect(effect).toMatchObject({ type: "CALL" });
      })
      .next(false)
      .select(appCurrentStateSelector)
      .next("active")
      .put(setConnectionStatus(false))
      .next()
      .select()
      .next(globalState)
      .delay(10000)
      .next()
      .select(appCurrentStateSelector);

    expect(updateMixpanelSuperProperties).toHaveBeenCalledWith(globalState);
  });

  it("should set connection status to false when NetInfo read fails", () => {
    const client = { getPing: jest.fn() } as any;
    const libraryResponse = E.left(new Error("netinfo error"));

    testSaga(connectionStatusSaga, client)
      .next()
      .select(appCurrentStateSelector)
      .next("active")
      .inspect(effect => {
        expect(effect).toMatchObject({ type: "CALL" });
      })
      .next(libraryResponse)
      .select(appCurrentStateSelector)
      .next("active")
      .put(setConnectionStatus(false))
      .next()
      .delay(10000)
      .next()
      .select(appCurrentStateSelector);

    expect(updateMixpanelSuperProperties).not.toHaveBeenCalled();
  });

  it("should set connection status to false when an exception is thrown", () => {
    const client = { getPing: jest.fn() } as any;

    testSaga(connectionStatusSaga, client)
      .next()
      .select(appCurrentStateSelector)
      .next("active")
      .inspect(effect => {
        expect(effect).toMatchObject({ type: "CALL" });
      })
      .throw(new Error("unexpected"))
      .put(setConnectionStatus(false))
      .next()
      .delay(10000)
      .next()
      .select(appCurrentStateSelector);

    expect(updateMixpanelSuperProperties).not.toHaveBeenCalled();
  });

  it("should not poll in background and wait for app to become active", () => {
    const client = { getPing: jest.fn() } as any;

    testSaga(connectionStatusSaga, client)
      .next()
      .select(appCurrentStateSelector)
      .next("background")
      .inspect(effect => {
        expect(effect).toMatchObject({ type: "CALL" });
      })
      .next()
      .select(appCurrentStateSelector);
  });

  it("should wait for app to become active when app state changes after fetchNetInfoState", () => {
    const client = { getPing: jest.fn() } as any;
    const libraryResponse = E.right({ isConnected: true });

    testSaga(connectionStatusSaga, client)
      .next()
      .select(appCurrentStateSelector)
      .next("active")
      .inspect(effect => {
        expect(effect).toMatchObject({ type: "CALL" });
      })
      .next(libraryResponse)
      .select(appCurrentStateSelector)
      .next("background")
      .inspect(effect => {
        expect(effect).toMatchObject({ type: "CALL" });
      })
      .next()
      .select(appCurrentStateSelector);
  });

  it("should wait for app to become active when app state changes during backend check", () => {
    const client = { getPing: jest.fn() } as any;
    const libraryResponse = E.right({ isConnected: true });

    testSaga(connectionStatusSaga, client)
      .next()
      .select(appCurrentStateSelector)
      .next("active")
      .inspect(effect => {
        expect(effect).toMatchObject({ type: "CALL" });
      })
      .next(libraryResponse)
      .select(appCurrentStateSelector)
      .next("active")
      .inspect(effect => {
        expect(effect).toMatchObject({ type: "CALL" });
      })
      .next(true)
      .select(appCurrentStateSelector)
      .next("background")
      .inspect(effect => {
        expect(effect).toMatchObject({ type: "CALL" });
      })
      .next()
      .select(appCurrentStateSelector);
  });
});

describe("connectivity root saga", () => {
  it("should create client and fork connectionStatusSaga", () => {
    const client = { getPing: jest.fn() } as any;

    testSaga(connectivityRootSaga)
      .next()
      .call(createConnectivityClient, apiUrlPrefix)
      .next(client)
      .fork(connectionStatusSaga, client)
      .next()
      .isDone();
  });
});

jest.mock("../../../../mixpanelConfig/superProperties", () => ({
  updateMixpanelSuperProperties: jest.fn()
}));
