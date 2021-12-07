import * as pot from "italia-ts-commons/lib/pot";
import { createStore } from "redux";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { WithUIMessageId } from "../../../../../store/reducers/entities/messages/types";
import {
  getGenericError,
  getNetworkErrorMessage,
  NetworkError
} from "../../../../../utils/errors";
import {
  mvlMock,
  mvlMockData,
  mvlMockId
} from "../../../types/__mock__/mvlMock";
import { mvlDetailsLoad } from "../../actions";
import { mvlFromIdSelector } from "../byId";

const mockFailure: WithUIMessageId<NetworkError> = {
  id: mvlMockId,
  ...getGenericError(new Error("A generic error"))
};

const errorFromFailure = new Error(getNetworkErrorMessage(mockFailure));

describe("mvl.byId reducer & selector behaviour", () => {
  jest.useFakeTimers();

  describe("When no mvlDetailsLoad have not been dispatch", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    it("should have mvl initial state equals to {}", () => {
      expect(globalState.features.mvl.byId).toStrictEqual({});
    });
    it("should return pot.none for any call to mvlFromIdSelector", () => {
      expect(mvlFromIdSelector(globalState, mvlMockId)).toStrictEqual(pot.none);
    });
  });

  describe("When mvlDetailsLoad.request has been dispatch", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(mvlDetailsLoad.request(mvlMockId));
    it("should return pot.noneLoading when call mvlFromIdSelector with the same id", () => {
      const byId = store.getState().features.mvl.byId;

      expect(byId[mvlMockId]).toStrictEqual(pot.noneLoading);
      expect(mvlFromIdSelector(store.getState(), mvlMockId)).toStrictEqual(
        pot.noneLoading
      );
    });
  });

  describe("When mvlDetailsLoad.success has been dispatched after a mvlDetailsLoad.request", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(mvlDetailsLoad.request(mvlMockId));
    store.dispatch(mvlDetailsLoad.success(mvlMock));
    it("should return pot.some when call mvlFromIdSelector with the same id", () => {
      const byId = store.getState().features.mvl.byId;

      expect(byId[mvlMockId]).toStrictEqual(pot.some(mvlMockData));
      expect(mvlFromIdSelector(store.getState(), mvlMockId)).toStrictEqual(
        pot.some(mvlMockData)
      );
    });
  });

  describe("When mvlDetailsLoad.failure has been dispatched after a mvlDetailsLoad.request", () => {
    it("should return pot.some when call mvlFromIdSelector with the same id", () => {
      const globalState = appReducer(
        undefined,
        applicationChangeState("active")
      );
      const store = createStore(appReducer, globalState as any);
      store.dispatch(mvlDetailsLoad.request(mvlMockId));
      store.dispatch(mvlDetailsLoad.failure(mockFailure));
      const byId = store.getState().features.mvl.byId;

      expect(byId[mvlMockId]).toStrictEqual(pot.noneError(errorFromFailure));
      expect(mvlFromIdSelector(store.getState(), mvlMockId)).toStrictEqual(
        pot.noneError(errorFromFailure)
      );
    });

    describe("And follows a mvlDetailsLoad.request and mvlDetailsLoad.success", () => {
      const globalState = appReducer(
        undefined,
        applicationChangeState("active")
      );
      const store = createStore(appReducer, globalState as any);
      store.dispatch(mvlDetailsLoad.request(mvlMockId));
      store.dispatch(mvlDetailsLoad.failure(mockFailure));
      it("should return pot.noneLoading first and pot.some", () => {
        store.dispatch(mvlDetailsLoad.request(mvlMockId));
        expect(store.getState().features.mvl.byId[mvlMockId]).toStrictEqual(
          pot.noneLoading
        );
        expect(mvlFromIdSelector(store.getState(), mvlMockId)).toStrictEqual(
          pot.noneLoading
        );

        store.dispatch(mvlDetailsLoad.success(mvlMock));

        expect(store.getState().features.mvl.byId[mvlMockId]).toStrictEqual(
          pot.some(mvlMockData)
        );
        expect(mvlFromIdSelector(store.getState(), mvlMockId)).toStrictEqual(
          pot.some(mvlMockData)
        );
      });
    });
  });
});
