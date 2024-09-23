/* eslint-disable @typescript-eslint/ban-ts-comment */
import { createStore } from "redux";
import * as netInfo from "@react-native-community/netinfo";
import { waitFor } from "@testing-library/react-native";
import { IngressScreen } from "../screens/IngressScreen";
import { renderScreenWithNavigationStoreContext } from "../../../utils/testWrapper";
import { applicationChangeState } from "../../../store/actions/application";
import { appReducer } from "../../../store/reducers";

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
    beforeAll(() =>
      // @ts-ignore
      jest.spyOn(netInfo, "fetch").mockResolvedValue({ isConnected: false })
    );

    it("Should display OperationResultsScreenContent", async () => {
      const { findByTestId, queryByTestId } = renderComponent();
      // Before the effect is resolved the loader should be displayed
      expect(queryByTestId("ingress-screen-loader-id")).toBeTruthy();

      const operationResults = await findByTestId("device-connection-lost-id");

      // Once the effect is resolved the loader shouldn't be displayed
      expect(queryByTestId("ingress-screen-loader-id")).toBeNull();
      expect(operationResults).toBeTruthy();
    });
  });
});

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
