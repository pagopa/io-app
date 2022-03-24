import { createStore, Store } from "redux";
import configureMockStore, { MockStore } from "redux-mock-store";
import { applicationChangeState } from "../../../../store/actions/application";
import { Action } from "../../../../store/actions/types";
import { appReducer } from "../../../../store/reducers";
import { GlobalState } from "../../../../store/reducers/types";
import { renderScreenFakeNavRedux } from "../../../../utils/testWrapper";
import { DEPRECATED_setMessageReadState } from "../../../../store/actions/messages";
import MVL_ROUTES from "../../navigation/routes";
import { mvlDetailsLoad } from "../../store/actions";
import { mvlMock, mvlMockId } from "../../types/__mock__/mvlMock";
import { MvlRouterScreen } from "../MvlRouterScreen";

jest.mock("@gorhom/bottom-sheet", () => ({
  useBottomSheetModal: () => ({
    present: jest.fn()
  })
}));

describe("MvlRouterScreen behaviour", () => {
  jest.useFakeTimers();

  describe("When the screen is rendered with the default state and feature.mvl.byId={}", () => {
    it("Should render the MvlLoadingScreen", () => {
      const render = dispatchActionAndRenderComponent([]);

      expect(render.component.queryByTestId("MvlLoadingScreen")).not.toBeNull();
    });

    it("Should dispatch a loading request", () => {
      const globalState = appReducer(
        undefined,
        applicationChangeState("active")
      );
      const store = createStore(appReducer, globalState as any);
      const mockStore = configureMockStore<GlobalState>();
      const finalStore: ReturnType<typeof mockStore> = mockStore({
        ...store.getState()
      } as GlobalState);
      renderComponent(finalStore);

      expect(finalStore.getActions()).toContainEqual(
        mvlDetailsLoad.request(mvlMockId)
      );
    });

    it("Should set the message ID as read", () => {
      const { store } = renderWithDefaultStore();
      expect(store.getActions()).toContainEqual(
        DEPRECATED_setMessageReadState(mvlMockId, true, "unknown")
      );
    });

    describe("And the mvlDetailsLoad fails", () => {
      it("Should render the MvlGenericFailureScreen", () => {
        const render = dispatchActionAndRenderComponent([]);

        render.store.dispatch(
          mvlDetailsLoad.failure({
            kind: "generic",
            id: mvlMockId,
            value: new Error("An error")
          })
        );

        expect(
          render.component.queryByTestId("MvlGenericErrorScreen")
        ).not.toBeNull();
      });
    });

    describe("And the mvlDetailsLoad is successful ", () => {
      it("Should render the MvlDetailsScreen", () => {
        const render = dispatchActionAndRenderComponent([]);

        render.store.dispatch(mvlDetailsLoad.success(mvlMock));

        expect(
          render.component.queryByTestId("MvlDetailsScreen")
        ).not.toBeNull();
      });
    });
  });

  describe("When the screen is rendered with a failure in feature.mvl.byId", () => {
    const failure = mvlDetailsLoad.failure({
      kind: "generic",
      id: mvlMockId,
      value: new Error("An error")
    });

    it("Should render the MvlLoadingScreen", () => {
      const render = dispatchActionAndRenderComponent([failure]);

      expect(render.component.queryByTestId("MvlLoadingScreen")).not.toBeNull();
    });

    it("Should dispatch a loading request", () => {
      const globalState = appReducer(
        undefined,
        applicationChangeState("active")
      );
      const store = createStore(appReducer, globalState as any);
      store.dispatch(failure);
      const mockStore = configureMockStore<GlobalState>();
      const finalStore: ReturnType<typeof mockStore> = mockStore({
        ...store.getState()
      } as GlobalState);
      renderComponent(finalStore);

      expect(finalStore.getActions()).toContainEqual(
        mvlDetailsLoad.request(mvlMockId)
      );
    });
  });

  describe("When the screen is rendered with a success in feature.mvl.byId", () => {
    const success = mvlDetailsLoad.success(mvlMock);

    it("Should render the MvlDetailsScreen", () => {
      const render = dispatchActionAndRenderComponent([
        mvlDetailsLoad.success(mvlMock)
      ]);
      expect(render.component.queryByTestId("MvlDetailsScreen")).not.toBeNull();
    });

    it("Should NOT dispatch a loading request", () => {
      const globalState = appReducer(
        undefined,
        applicationChangeState("active")
      );
      const store = createStore(appReducer, globalState as any);
      store.dispatch(mvlDetailsLoad.success(mvlMock));
      const mockStore = configureMockStore<GlobalState>();
      const finalStore: ReturnType<typeof mockStore> = mockStore({
        ...store.getState()
      } as GlobalState);
      renderComponent(finalStore);

      expect(finalStore.getActions()).not.toContainEqual(
        mvlDetailsLoad.request(mvlMockId)
      );
    });

    it("Should set the message ID as read", () => {
      const { store } = renderWithDefaultStore();
      store.dispatch(success);
      expect(store.getActions()).toContainEqual(
        DEPRECATED_setMessageReadState(mvlMockId, true, "unknown")
      );
    });
  });
});

const dispatchActionAndRenderComponent = (actions: ReadonlyArray<Action>) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, globalState as any);
  actions.forEach(a => store.dispatch(a));
  return renderComponent(store);
};

const renderComponent = (store: MockStore<GlobalState> | Store) => ({
  component: renderScreenFakeNavRedux<GlobalState>(
    MvlRouterScreen,
    MVL_ROUTES.DETAILS,
    { id: mvlMockId },
    store
  ),
  store
});

function renderWithDefaultStore() {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, globalState as any);
  const mockStore = configureMockStore<GlobalState>();
  const finalStore: ReturnType<typeof mockStore> = mockStore({
    ...store.getState()
  } as GlobalState);
  const result = renderComponent(finalStore);
  return { ...result, store: result.store as MockStore<GlobalState> };
}
