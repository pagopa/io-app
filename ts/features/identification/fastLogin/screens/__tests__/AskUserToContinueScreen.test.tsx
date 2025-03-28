import { render, fireEvent } from "@testing-library/react-native";
import { Provider } from "react-redux";
import { Store, createStore } from "redux";
import * as _ from "lodash";
import type { IOPictograms } from "@pagopa/io-app-design-system";
import AskUserInteractionScreen, { Props } from "../AskUserInteractionScreen";
import { GlobalState } from "../../../../../store/reducers/types";
import { appReducer } from "../../../../../store/reducers";
import { applicationChangeState } from "../../../../../store/actions/application";

jest.useFakeTimers();

const globalState = appReducer(undefined, applicationChangeState("active"));
const store = createStore(appReducer, globalState as any);

const primaryActionButtonTitle = "Continue";
const secondaryActionButtonTitle = "Cancel";

const defaultProps = {
  title: "Test title",
  subtitle: "Test subtitle",
  pictogramName: "timing" as IOPictograms,
  primaryAction: {
    label: primaryActionButtonTitle,
    accessibilityLabel: primaryActionButtonTitle,
    onPress: jest.fn()
  },
  secondaryAction: {
    label: secondaryActionButtonTitle,
    accessibilityLabel: secondaryActionButtonTitle,
    onPress: jest.fn()
  }
};

describe("AskUserInteractionScreen component", () => {
  it("should render properly", () => {
    const { getByText } = renderComponent(defaultProps, store);

    expect(getByText(defaultProps.title)).toBeTruthy();
    expect(getByText(defaultProps.subtitle)).toBeTruthy();
    const continueButton = getByText(primaryActionButtonTitle);
    const cancelButton = getByText(secondaryActionButtonTitle);
    expect(continueButton).toBeTruthy();
    expect(cancelButton).toBeTruthy();
  });

  it("should call primaryAction onPress when the primary button is pressed", () => {
    const { getByText } = renderComponent(defaultProps, store);
    const button = getByText(primaryActionButtonTitle);
    fireEvent.press(button);
    expect(defaultProps.primaryAction.onPress).toHaveBeenCalled();
  });

  it("should call secondaryAction onPress when the secondary button is pressed", () => {
    const { getByText } = renderComponent(defaultProps, store);
    const button = getByText(secondaryActionButtonTitle);
    fireEvent.press(button);
    expect(defaultProps.secondaryAction.onPress).toHaveBeenCalled();
  });

  it("does not render primary button if primaryAction is not provided", () => {
    const { queryByText } = renderComponent(
      _.omit(defaultProps, "primaryAction"),
      store
    );
    expect(queryByText(primaryActionButtonTitle)).toBeNull();
  });

  it("does not render secondary button if secondaryAction is not provided", () => {
    const { queryByText } = renderComponent(
      _.omit(defaultProps, "secondaryAction"),
      store
    );
    expect(queryByText(secondaryActionButtonTitle)).toBeNull();
  });
});

const renderComponent = (props: Props, store: Store<GlobalState>) =>
  render(
    <Provider store={store}>
      <AskUserInteractionScreen {...props} />
    </Provider>
  );
