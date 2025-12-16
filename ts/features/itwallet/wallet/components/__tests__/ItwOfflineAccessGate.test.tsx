import { fireEvent } from "@testing-library/react-native";
import { View } from "react-native";
import { createStore } from "redux";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import * as selectors from "../../../common/store/selectors/securePreferences";
import { ItwOfflineAccessGate } from "../ItwOfflineAccessGate";

describe("itwOfflineAccessCounterSelector", () => {
  it("should render the children when the offline access limit is not reached", () => {
    jest
      .spyOn(selectors, "itwIsOfflineAccessLimitReached")
      .mockReturnValue(false);
    jest
      .spyOn(selectors, "itwShouldDisplayOfflineAccessLimitWarning")
      .mockReturnValue(false);

    const { queryByTestId } = renderComponent();
    expect(queryByTestId("itwOfflineAccessGateWarningTestID")).toBeFalsy();
    expect(queryByTestId("itwOfflineAccessGateLimitReachedTestID")).toBeFalsy();
    expect(queryByTestId("childrenContentTestID")).toBeTruthy();
  });

  it("should display warning when offline access limit is reached", () => {
    jest
      .spyOn(selectors, "itwIsOfflineAccessLimitReached")
      .mockReturnValue(false);
    jest
      .spyOn(selectors, "itwShouldDisplayOfflineAccessLimitWarning")
      .mockReturnValue(true);

    const { queryByTestId } = renderComponent();
    expect(queryByTestId("itwOfflineAccessGateWarningTestID")).toBeTruthy();
    expect(queryByTestId("itwOfflineAccessGateLimitReachedTestID")).toBeFalsy();
    expect(queryByTestId("childrenContentTestID")).toBeFalsy();
  });

  it("should remove warning when cta pressed", () => {
    jest
      .spyOn(selectors, "itwIsOfflineAccessLimitReached")
      .mockReturnValue(false);
    jest
      .spyOn(selectors, "itwShouldDisplayOfflineAccessLimitWarning")
      .mockReturnValue(true);

    const { queryByTestId, getByTestId } = renderComponent();

    const cta = getByTestId("itwOfflineAccessGateWarningActionTestID");
    fireEvent(cta, "onPress");

    expect(queryByTestId("itwOfflineAccessGateWarningTestID")).toBeFalsy();
    expect(queryByTestId("itwOfflineAccessGateLimitReachedTestID")).toBeFalsy();
    expect(queryByTestId("childrenContentTestID")).toBeTruthy();
  });

  it("should display limit reached screeen", () => {
    jest
      .spyOn(selectors, "itwIsOfflineAccessLimitReached")
      .mockReturnValue(true);
    jest
      .spyOn(selectors, "itwShouldDisplayOfflineAccessLimitWarning")
      .mockReturnValue(false);

    const { queryByTestId } = renderComponent();
    expect(queryByTestId("itwOfflineAccessGateWarningTestID")).toBeFalsy();
    expect(
      queryByTestId("itwOfflineAccessGateLimitReachedTestID")
    ).toBeTruthy();
    expect(queryByTestId("childrenContentTestID")).toBeFalsy();
  });
});

const renderComponent = () => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, globalState as any);
  return renderScreenWithNavigationStoreContext(
    () => (
      <ItwOfflineAccessGate>
        <View testID="childrenContentTestID" />
      </ItwOfflineAccessGate>
    ),
    "ANY_ROUTE",
    {},
    store
  );
};
