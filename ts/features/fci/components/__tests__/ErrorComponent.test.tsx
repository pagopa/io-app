import "react-native";
import { Provider } from "react-redux";
import React from "react";
import configureMockStore from "redux-mock-store";
import { constNull } from "fp-ts/lib/function";
import ErrorComponent from "../ErrorComponent";
import { appReducer } from "../../../../store/reducers";
import { applicationChangeState } from "../../../../store/actions/application";
import { GlobalState } from "../../../../store/reducers/types";
import { renderScreenFakeNavRedux } from "../../../../utils/testWrapper";
import { FCI_ROUTES } from "../../navigation/routes";
import { Props } from "../../../fci/components/ErrorComponent";

const fakeTestID = "fakeTestID";

describe("Test ErrorComponent", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  it("with all props should render an ErrorComponent correctly", () => {
    const props: Props = {
      title: "title",
      subTitle: "subTitle",
      pictogram: "airBaloon",
      onPress: constNull
    };
    const component = renderComponent({ ...props });
    expect(component.queryByTestId(fakeTestID)).toBeTruthy();
  });
  it("with all props should render a ErrorComponent with right title and subtitle label", () => {
    const props: Props = {
      title: "title",
      subTitle: "subTitle",
      pictogram: "airBaloon",
      onPress: constNull
    };
    const component = renderComponent({ ...props });
    expect(component.queryByTestId(fakeTestID)).toBeTruthy();
    expect(component.queryByText(props.title)).toBeTruthy();
    expect(component.queryByText(props.subTitle)).toBeTruthy();
  });
  it("with all props should render a FootStackButtons with close button", () => {
    const props: Props = {
      title: "title",
      subTitle: "subTitle",
      pictogram: "airBaloon",
      onPress: constNull
    };
    const component = renderComponent({ ...props });
    expect(component.queryByTestId(fakeTestID)).toBeTruthy();
    const closeButton = component.getByTestId("FciCloseButtonTestID");
    expect(closeButton).not.toBeNull();
  });
  it("with all props should render a FootStackButtons with retry button and a close button", () => {
    const props: Props = {
      title: "title",
      subTitle: "subTitle",
      pictogram: "airBaloon",
      retry: true,
      onPress: constNull
    };
    const component = renderComponent({ ...props });
    expect(component.queryByTestId(fakeTestID)).toBeTruthy();
    expect(component.getByTestId("FciRetryButtonTestID")).not.toBeNull();
    expect(component.getByTestId("FciCloseButtonTestID")).not.toBeNull();
  });
  it("with all props should render a FootStackButtons with retry button and assistance button", () => {
    const props: Props = {
      title: "title",
      subTitle: "subTitle",
      pictogram: "airBaloon",
      retry: true,
      assistance: true,
      onPress: constNull
    };
    const component = renderComponent({ ...props });
    expect(component.queryByTestId(fakeTestID)).toBeTruthy();
    expect(component.getByTestId("FciRetryButtonTestID")).not.toBeNull();
    expect(component.getByTestId("FciAssistanceButtonTestID")).not.toBeNull();
  });
  it("with all props should render a FootStackButtons with assistance button and a close button", () => {
    const props: Props = {
      title: "title",
      subTitle: "subTitle",
      pictogram: "airBaloon",
      assistance: true,
      onPress: constNull
    };
    const component = renderComponent({ ...props });
    expect(component.queryByTestId(fakeTestID)).toBeTruthy();
    expect(component.getByTestId("FciCloseButtonTestID")).not.toBeNull();
    expect(component.getByTestId("FciAssistanceButtonTestID")).not.toBeNull();
  });
});

const renderComponent = (props: Props) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const mockStore = configureMockStore<GlobalState>();
  const store: ReturnType<typeof mockStore> = mockStore(globalState);

  const Component = (
    <Provider store={store}>
      <ErrorComponent {...props} testID={fakeTestID} onPress={constNull} />
    </Provider>
  );

  return renderScreenFakeNavRedux<GlobalState>(
    () => Component,
    FCI_ROUTES.ROUTER,
    {},
    store
  );
};
