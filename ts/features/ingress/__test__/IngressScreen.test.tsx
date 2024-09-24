/* eslint-disable @typescript-eslint/ban-ts-comment */
import { createStore } from "redux";
import * as netInfo from "@react-native-community/netinfo";
import { waitFor } from "@testing-library/react-native";
import { act } from "react-test-renderer";
import { IngressScreen } from "../screens/IngressScreen";
import { renderScreenWithNavigationStoreContext } from "../../../utils/testWrapper";
import { applicationChangeState } from "../../../store/actions/application";
import { appReducer } from "../../../store/reducers";
import I18n from "../../../i18n";
import * as backendStatusSelectors from "../../../store/reducers/backendStatus";

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
        .spyOn(netInfo, "fetch")
        // @ts-ignore
        .mockResolvedValueOnce({ isConnected: false });
      const { findByTestId, queryByTestId } = renderComponent();
      // Before the effect is resolved the loader should be displayed
      expect(queryByTestId("ingress-screen-loader-id")).toBeTruthy();

      const operationResults = await findByTestId("device-connection-lost-id");

      // Once the effect is resolved the loader shouldn't be displayed
      expect(queryByTestId("ingress-screen-loader-id")).toBeNull();
      expect(operationResults).toBeTruthy();
    });
  });
  describe("IngressScreen when slowdowns occur", () => {
    beforeEach(() => {
      jest.clearAllTimers();
      jest.clearAllMocks();
    });
    it("Should update LoadingScreenContent contentTitle after 5 sec and display the cdn unreachable blocking screen after 10", async () => {
      const {
        getDeviceBlockingScreen,
        queryByText,
        getFirstText,
        getSecondText
      } = await renderComponentWithSlowdowns();

      await act(() => {
        jest.advanceTimersByTime(5000);
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
    it("Should update LoadingScreenContent contentTitle after 5s and display the slowdowns blocking screen after 10s", async () => {
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
        jest.advanceTimersByTime(5000);
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
