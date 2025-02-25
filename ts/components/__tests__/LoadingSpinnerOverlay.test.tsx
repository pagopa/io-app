import { render } from "@testing-library/react-native";
import { ReactNode } from "react";
import { Text } from "react-native";
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";
import { applicationChangeState } from "../../store/actions/application";
import { appReducer } from "../../store/reducers";
import { GlobalState } from "../../store/reducers/types";
import LoadingSpinnerOverlay from "../LoadingSpinnerOverlay";

describe("LoadingSpinnerOverlay", () => {
  it("Should match base no-loading snapshot", () => {
    const component = renderComponent(false);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("Should match base loading snapshot", () => {
    const component = renderComponent(true);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("Should match all-properties and not-loading snapshot", () => {
    const child = <Text>This is a child</Text>;
    const loadingCaption = "This is the loading caption";
    const loadingOpacity = 0.65;
    const onCancelCallback = () => undefined;
    const component = renderComponent(
      false,
      child,
      loadingCaption,
      loadingOpacity,
      onCancelCallback
    );
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("Should match all-properties and loading snapshot", () => {
    const child = <Text>This is a child</Text>;
    const loadingCaption = "This is the loading caption";
    const loadingOpacity = 0.65;
    const onCancelCallback = () => undefined;
    const component = renderComponent(
      true,
      child,
      loadingCaption,
      loadingOpacity,
      onCancelCallback
    );
    expect(component.toJSON()).toMatchSnapshot();
  });
});

const renderComponent = (
  isLoading: boolean,
  children?: ReactNode,
  loadingCaption?: string,
  loadingOpacity?: number,
  onCancel?: () => void
) => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const mockStore = configureMockStore<GlobalState>();
  const store: ReturnType<typeof mockStore> = mockStore(initialState);
  return render(
    <Provider store={store}>
      <LoadingSpinnerOverlay
        isLoading={isLoading}
        loadingCaption={loadingCaption}
        loadingOpacity={loadingOpacity}
        onCancel={onCancel}
      >
        {children}
      </LoadingSpinnerOverlay>
    </Provider>
  );
};
