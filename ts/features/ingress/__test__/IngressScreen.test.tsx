import { createStore } from "redux";
import { waitFor } from "@testing-library/react-native";
import { act } from "react-test-renderer";
import I18n from "i18next";
import { IngressScreen } from "../screens/IngressScreen";
import { renderScreenWithNavigationStoreContext } from "../../../utils/testWrapper";
import { applicationChangeState } from "../../../store/actions/application";
import { appReducer } from "../../../store/reducers";
import * as backendStatusSelectors from "../../../store/reducers/backendStatus/remoteConfig";
import * as selectors from "../../connectivity/store/selectors";
import * as itwSelectors from "../../itwallet/common/store/selectors";
import * as ioHook from "../../../store/hooks";
import { identificationRequest } from "../../identification/store/actions";
import { IdentificationBackActionType } from "../../identification/store/reducers";

jest.useFakeTimers();

describe(IngressScreen, () => {
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
    it("It should begin the identification flow", async () => {
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

      await act(() => {
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

      await act(() => {
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
});

const renderComponentWithSlowdowns = async () => {
  const { queryByText, queryByTestId } = renderComponent();
  const getFirstText = () => queryByText(I18n.t("startup.title"));
  const getSecondText = () => queryByText(I18n.t("startup.title2"));
  const getDeviceBlockingScreen = () =>
    queryByTestId("device-blocking-screen-id");

  expect(getFirstText()).toBeTruthy();
  expect(getSecondText()).toBeNull();

  await act(() => {
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
