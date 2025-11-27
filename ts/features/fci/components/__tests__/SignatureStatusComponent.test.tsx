import { constNull } from "fp-ts/lib/function";
import "react-native";
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";
import { applicationChangeState } from "../../../../store/actions/application";
import { appReducer } from "../../../../store/reducers";
import { GlobalState } from "../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import { FCI_ROUTES } from "../../navigation/routes";
import SignatureStatusComponent, { Props } from "../SignatureStatusComponent";

const fakeTestID = "fakeTestID";

describe("Test ErrorComponent", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  it("with all props should render an SignatureStatusComponent correctly", () => {
    const props: Props = {
      title: "title",
      subTitle: "subTitle",
      pictogram: "attention",
      onPress: constNull
    };
    const component = renderComponent({ ...props });
    expect(component.queryByTestId(fakeTestID)).toBeTruthy();
  });
  it("with all props should render a SignatureStatusComponent with right title and subtitle label", () => {
    const props: Props = {
      title: "title",
      subTitle: "subTitle",
      pictogram: "attention",
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
      pictogram: "attention",
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
      pictogram: "attention",
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
      pictogram: "attention",
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
      pictogram: "attention",
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
      <SignatureStatusComponent
        {...props}
        testID={fakeTestID}
        onPress={constNull}
      />
    </Provider>
  );

  return renderScreenWithNavigationStoreContext<GlobalState>(
    () => Component,
    FCI_ROUTES.ROUTER,
    {},
    store
  );
};
