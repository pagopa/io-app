import { createStore } from "redux";
import { fireEvent } from "@testing-library/react-native";
import I18n from "i18next";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import TosWebviewErrorComponent from "../TosWebviewErrorComponent";

describe("TosWebviewErrorComponent", () => {
  it("should render the error UI and call handleRetry on retry button press", () => {
    const handleRetryMock = jest.fn();

    const { getByTestId, getByText } = renderComponent(handleRetryMock);

    // Assert components are rendered
    expect(getByTestId("toSErrorContainerView")).toBeTruthy();
    expect(getByTestId("toSErrorContainerTitle")).toBeTruthy();
    expect(getByText(I18n.t("global.buttons.retry"))).toBeTruthy();

    // Simulate button press
    fireEvent.press(getByText(I18n.t("global.buttons.retry")));
    expect(handleRetryMock).toHaveBeenCalled();
  });
});

const renderComponent = (handleRetryProp?: () => void) => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, initialState as any);
  return renderScreenWithNavigationStoreContext(
    () => (
      <TosWebviewErrorComponent
        handleRetry={handleRetryProp ? handleRetryProp : jest.fn()}
      />
    ),
    "DUMMY",
    {},
    store
  );
};
