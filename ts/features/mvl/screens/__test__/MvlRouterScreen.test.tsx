import { NavigationParams } from "react-navigation";
import { createStore, Store } from "redux";
import configureMockStore from "redux-mock-store";
import { applicationChangeState } from "../../../../store/actions/application";
import { appReducer } from "../../../../store/reducers";
import { GlobalState } from "../../../../store/reducers/types";
import { renderScreenFakeNavRedux } from "../../../../utils/testWrapper";
import MVL_ROUTES from "../../navigation/routes";
import { mvlDetailsLoad } from "../../store/actions";
import { mvlMockData, mvlMockId } from "../../types/__mock__/mvlMock";
import { MvlRouterScreen } from "../MvlRouterScreen";

describe("MvlRouterScreen behaviour", () => {
  jest.useFakeTimers();

  describe("When the screen is rendered with the default state and feature.mvl.byId={}", () => {
    it("Should render the MvlLoadingScreen", () => {
      const globalState = appReducer(
        undefined,
        applicationChangeState("active")
      );
      const store = createStore(appReducer, globalState as any);
      const render = renderComponent(store);

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

      expect(finalStore.getActions()).toStrictEqual([
        mvlDetailsLoad.request(mvlMockId)
      ]);
    });

    describe("And the mvlDetailsLoad fails", () => {
      it("Should render the MvlGenericFailureScreen", () => {
        const globalState = appReducer(
          undefined,
          applicationChangeState("active")
        );
        const store = createStore(appReducer, globalState as any);
        const render = renderComponent(store);

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
        const globalState = appReducer(
          undefined,
          applicationChangeState("active")
        );
        const store = createStore(appReducer, globalState as any);
        const render = renderComponent(store);

        render.store.dispatch(mvlDetailsLoad.success(mvlMockData));

        expect(
          render.component.queryByTestId("MvlDetailsScreen")
        ).not.toBeNull();
      });
    });
  });
  describe("When the screen is rendered with a failure in feature.mvl.byId", () => {
    it("Should render the MvlLoadingScreen", () => {
      const globalState = appReducer(
        undefined,
        applicationChangeState("active")
      );
      const store = createStore(appReducer, globalState as any);
      store.dispatch(
        mvlDetailsLoad.failure({
          kind: "generic",
          id: mvlMockId,
          value: new Error("An error")
        })
      );
      const render = renderComponent(store);

      expect(render.component.queryByTestId("MvlLoadingScreen")).not.toBeNull();
    });

    it("Should dispatch a loading request", () => {
      const globalState = appReducer(
        undefined,
        applicationChangeState("active")
      );
      const store = createStore(appReducer, globalState as any);
      store.dispatch(
        mvlDetailsLoad.failure({
          kind: "generic",
          id: mvlMockId,
          value: new Error("An error")
        })
      );
      const mockStore = configureMockStore<GlobalState>();
      const finalStore: ReturnType<typeof mockStore> = mockStore({
        ...store.getState()
      } as GlobalState);
      renderComponent(finalStore);

      expect(finalStore.getActions()).toStrictEqual([
        mvlDetailsLoad.request(mvlMockId)
      ]);
    });
  });

  describe("When the screen is rendered with a success in feature.mvl.byId", () => {
    it("Should render the MvlDetailsScreen", () => {
      const globalState = appReducer(
        undefined,
        applicationChangeState("active")
      );
      const store = createStore(appReducer, globalState as any);
      store.dispatch(mvlDetailsLoad.success(mvlMockData));
      const render = renderComponent(store);

      expect(render.component.queryByTestId("MvlDetailsScreen")).not.toBeNull();
    });

    it("Should NOT dispatch a loading request", () => {
      const globalState = appReducer(
        undefined,
        applicationChangeState("active")
      );
      const store = createStore(appReducer, globalState as any);
      store.dispatch(mvlDetailsLoad.success(mvlMockData));
      const mockStore = configureMockStore<GlobalState>();
      const finalStore: ReturnType<typeof mockStore> = mockStore({
        ...store.getState()
      } as GlobalState);
      renderComponent(finalStore);

      expect(finalStore.getActions()).toStrictEqual([]);
    });
  });
});

const renderComponent = (store: Store) => ({
  component: renderScreenFakeNavRedux<GlobalState, NavigationParams>(
    MvlRouterScreen,
    MVL_ROUTES.DETAILS,
    { id: mvlMockId },
    store
  ),
  store
});
