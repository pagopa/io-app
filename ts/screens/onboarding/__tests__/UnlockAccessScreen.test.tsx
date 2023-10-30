import { fireEvent } from "@testing-library/react-native";
import { createStore } from "redux";
import { applicationChangeState } from "../../../store/actions/application";
import { appReducer } from "../../../store/reducers";
import { renderScreenWithNavigationStoreContext } from "../../../utils/testWrapper";
import UnlockAccessScreen from "../UnlockAccessScreen";

const mockOpenWebUrl = jest.fn();

jest.mock("../../../utils/url", () => ({
  openWebUrl: (_: string) => {
    mockOpenWebUrl();
  }
}));

describe("UnlockAccessScreen", async () => {
  it("the components into the page should be render correctly", () => {
    const component = renderComponent();
    expect(component).toBeDefined();
    expect(component.getByTestId("container-test")).not.toBeNull();
    expect(component.getByTestId("title-test")).toBeDefined();
    expect(component.getByTestId("subtitle-test")).toBeDefined();
    const learnMoreButton = component.getByTestId("learn-more-link-test");
    expect(learnMoreButton).toBeDefined();

    const unlockProfileButton = component.getByTestId("button-solid-test");
    expect(unlockProfileButton).toBeDefined();
    const closeButton = component.getByTestId("button-link-test");
    expect(closeButton).toBeDefined();
  });
  it("click on button to unlock profile", () => {
    const component = renderComponent();
    expect(component).toBeDefined();
    const unlockProfileButton = component.getByTestId("button-solid-test");

    if (unlockProfileButton) {
      fireEvent.press(unlockProfileButton);
      expect(mockOpenWebUrl).toHaveBeenCalled();
    }
  });
  it("click on button to go back to landing page", () => {
    const component = renderComponent();
    expect(component).toBeDefined();
    const closeButton = component.getByTestId("button-link-test");

    if (closeButton) {
      fireEvent.press(closeButton);
      expect(mockOpenWebUrl).toHaveBeenCalled();
    }
  });
});

const renderComponent = () => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, globalState as any);

  return renderScreenWithNavigationStoreContext(
    UnlockAccessScreen,
    "DUMMY",
    {},
    store
  );
};
