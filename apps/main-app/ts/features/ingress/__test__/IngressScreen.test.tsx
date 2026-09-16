import { act, waitFor } from "@testing-library/react-native";
import I18n from "i18next";
import { createStore } from "redux";

import {
  applicationChangeState,
  startApplicationInitialization
} from "../../../store/actions/application";
import * as ioHook from "../../../store/hooks";
import { appReducer } from "../../../store/reducers";
import * as backendStatusSelectors from "../../../store/reducers/backendStatus/remoteConfig";
import { renderScreenWithNavigationStoreContext } from "../../../utils/testWrapper";
import { setConnectionStatus } from "../../connectivity/store/actions";
import * as selectors from "../../connectivity/store/selectors";
import { identificationRequest } from "../../identification/store/actions";
import { IdentificationBackActionType } from "../../identification/store/reducers";
import * as itwSelectors from "../../itwallet/common/store/selectors";
import { IngressScreen } from "../screens/IngressScreen";
import { isBlockingScreenSelector } from "../store/selectors";

jest.useFakeTimers();

describe(IngressScreen, () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("Should be defined", () => {
    const component = renderComponent();

    expect(component).toBeDefined();
  });
  it("Should match the snapshot", () => {
    const component = renderComponent();

    expect(component).toMatchSnapshot();
  });
  describe("IngressScreen with device connection enabled", () => {
    it("Should not display OperationResultsScreenContent", async () => {
      const { queryByTestId, getByTestId } = renderComponent();
      const operationResults = await waitFor(
        () => queryByTestId("device-connection-lost-id"),
        { timeout: 1000 }
      );
      const loader = getByTestId("ingress-screen-loader-id");
      expect(operationResults).toBeNull();
      expect(loader).toBeTruthy();
    });
  });
  describe("IngressScreen with device connection disabled", () => {
    it("Should display OperationResultsScreenContent", async () => {
      jest
        .spyOn(selectors, "isConnectedSelector")
        .mockImplementation(() => false);
      jest
        .spyOn(itwSelectors, "itwOfflineAccessAvailableSelector")
        .mockImplementation(() => false);

      const { findByTestId, queryByTestId } = renderComponent();

      const operationResults = await findByTestId("device-connection-lost-id");

      expect(queryByTestId("ingress-screen-loader-id")).toBeNull();
      expect(operationResults).toBeTruthy();
    });
    it("should begin the identification flow", async () => {
      const testDispatch = jest.fn();
      jest
        .spyOn(selectors, "isConnectedSelector")
        .mockImplementation(() => false);
      jest
        .spyOn(itwSelectors, "itwOfflineAccessAvailableSelector")
        .mockImplementation(() => true);
      jest
        .spyOn(ioHook, "useIODispatch")
        .mockImplementation(() => testDispatch);

      renderComponent();

      await waitFor(() => {
        expect(testDispatch).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(testDispatch).toHaveBeenCalledWith(
          identificationRequest(
            false,
            false,
            undefined,
            undefined,
            expect.any(Object),
            undefined,
            IdentificationBackActionType.CLOSE_APP
          )
        );
      });
    });
  });

  describe("IngressScreen when slowdowns occur", () => {
    beforeEach(() => {
      jest.clearAllTimers();
      jest.clearAllMocks();
    });
    it("Should update LoadingScreenContent contentTitle after 5 sec and display the cdn unreachable blocking screen after 20", async () => {
      const {
        getDeviceBlockingScreen,
        queryByText,
        getFirstText,
        getSecondText
      } = await renderComponentWithSlowdowns();

      act(() => {
        jest.advanceTimersByTime(20000);
      });

      expect(getDeviceBlockingScreen()).toBeTruthy();
      expect(
        queryByText(I18n.t("startup.cdn_unreachable_results_screen.title"))
      ).toBeTruthy();
      expect(
        queryByText(I18n.t("startup.slowdowns_results_screen.title"))
      ).toBeNull();
      expect(getFirstText()).toBeNull();
      expect(getSecondText()).toBeNull();
    });
    it("Should update LoadingScreenContent contentTitle after 5s and display the slowdowns blocking screen after 20s", async () => {
      jest
        .spyOn(backendStatusSelectors, "isBackendStatusLoadedSelector")
        .mockImplementation(() => true);

      const {
        getDeviceBlockingScreen,
        queryByText,
        getFirstText,
        getSecondText
      } = await renderComponentWithSlowdowns();

      act(() => {
        jest.advanceTimersByTime(20000);
      });

      expect(getDeviceBlockingScreen()).toBeTruthy();
      expect(
        queryByText(I18n.t("startup.cdn_unreachable_results_screen.title"))
      ).toBeNull();
      expect(
        queryByText(I18n.t("startup.slowdowns_results_screen.title"))
      ).toBeTruthy();
      expect(getFirstText()).toBeNull();
      expect(getSecondText()).toBeNull();
    });
  });

  describe("IngressScreen recovering from offline -> online", () => {
    beforeEach(() => {
      jest.clearAllTimers();
      jest.clearAllMocks();
    });

    it("resets the stale isBlockingScreen flag and restarts the bootstrap saga once connectivity is restored", async () => {
      jest
        .spyOn(itwSelectors, "itwOfflineAccessAvailableSelector")
        .mockImplementation(() => false);
      const isConnectedMock = jest
        .spyOn(selectors, "isConnectedSelector")
        .mockImplementation(() => false);

      const initialState = appReducer(
        undefined,
        applicationChangeState("active")
      );
      const store = createStore(appReducer, initialState as any);
      const dispatchSpy = jest.spyOn(store, "dispatch");

      const { findByTestId, queryByTestId } =
        renderScreenWithNavigationStoreContext(
          IngressScreen,
          "NO_ROUTE",
          {},
          store
        );

      await findByTestId("device-connection-lost-id");
      expect(isBlockingScreenSelector(store.getState())).toBe(true);

      // Connectivity is restored.
      isConnectedMock.mockImplementation(() => true);
      act(() => {
        store.dispatch(setConnectionStatus(true));
      });

      await waitFor(() => {
        expect(isBlockingScreenSelector(store.getState())).toBe(false);
      });
      expect(dispatchSpy).toHaveBeenCalledWith(
        startApplicationInitialization()
      );
      expect(queryByTestId("device-connection-lost-id")).toBeNull();
      expect(queryByTestId("device-blocking-screen-id")).toBeNull();
    });

    it("does not touch isBlockingScreen when the app was never offline", async () => {
      jest
        .spyOn(itwSelectors, "itwOfflineAccessAvailableSelector")
        .mockImplementation(() => false);

      const initialState = appReducer(
        undefined,
        applicationChangeState("active")
      );
      const store = createStore(appReducer, initialState as any);
      const dispatchSpy = jest.spyOn(store, "dispatch");

      renderScreenWithNavigationStoreContext(
        IngressScreen,
        "NO_ROUTE",
        {},
        store
      );

      act(() => {
        store.dispatch(setConnectionStatus(true));
      });

      expect(isBlockingScreenSelector(store.getState())).toBe(false);
      expect(dispatchSpy).not.toHaveBeenCalledWith(
        startApplicationInitialization()
      );
    });
  });
});

const renderComponentWithSlowdowns = async () => {
  const { queryByText, queryByTestId } = renderComponent();
  const getFirstText = () => queryByText(I18n.t("startup.title"));
  const getSecondText = () => queryByText(I18n.t("startup.title2"));
  const getDeviceBlockingScreen = () =>
    queryByTestId("device-blocking-screen-id");

  expect(getFirstText()).toBeTruthy();
  expect(getSecondText()).toBeNull();

  act(() => {
    jest.advanceTimersByTime(5000);
  });

  expect(getFirstText()).toBeNull();
  expect(getSecondText()).toBeTruthy();
  expect(getDeviceBlockingScreen()).toBeNull();

  return {
    queryByText,
    queryByTestId,
    getFirstText,
    getSecondText,
    getDeviceBlockingScreen
  };
};

const renderComponent = () => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, initialState as any);

  return renderScreenWithNavigationStoreContext(
    IngressScreen,
    "NO_ROUTE",
    {},
    store
  );
};
