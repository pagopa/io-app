import type { IOPictograms } from "@pagopa/io-app-design-system";
import { fireEvent, render } from "@testing-library/react-native";
import * as _ from "lodash";
import { Provider } from "react-redux";
import { Store, createStore } from "redux";
import { OperationResultScreenContentProps } from "../../../../../components/screens/OperationResultScreenContent";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import AskUserInteractionScreen from "../AskUserInteractionScreen";

jest.useFakeTimers();

const globalState = appReducer(undefined, applicationChangeState("active"));
const store = createStore(appReducer, globalState as any);

const primaryActionButtonTitle = "Continue";
const secondaryActionButtonTitle = "Cancel";

const defaultProps = {
  title: "Test title",
  subtitle: "Test subtitle",
  pictogram: "timing" as IOPictograms,
  action: {
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
    expect(defaultProps.action.onPress).toHaveBeenCalled();
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

const renderComponent = (
  props: OperationResultScreenContentProps,
  store: Store<GlobalState>
) =>
  render(
    <Provider store={store}>
      <AskUserInteractionScreen {...props} />
    </Provider>
  );
