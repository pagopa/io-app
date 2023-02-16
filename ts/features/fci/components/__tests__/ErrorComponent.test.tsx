import "react-native";
import { Provider } from "react-redux";
import React from "react";
import configureMockStore from "redux-mock-store";
import { constNull } from "fp-ts/lib/function";
import ErrorComponent from "../ErrorComponent";
import I18n from "../../../../i18n";
import { appReducer } from "../../../../store/reducers";
import { applicationChangeState } from "../../../../store/actions/application";
import { GlobalState } from "../../../../store/reducers/types";
import { renderScreenFakeNavRedux } from "../../../../utils/testWrapper";
import { FCI_ROUTES } from "../../navigation/routes";

const fakeTestID = "fakeTestID";

type Props = {
  title: string;
  subTitle: string;
  image: number;
};

describe("Test ErrorComponent", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  it("with all props should render a ErrorComponent correctly", () => {
    const props = {
      title: "title",
      subTitle: "subTitle",
      image: 1
    };
    const component = renderComponent({ ...props });
    expect(component.queryByTestId(fakeTestID)).toBeTruthy();
  });
  it("with all props should render a ErrorComponent with right title and subtitle label", () => {
    const props = {
      title: "title",
      subTitle: "subTitle",
      image: 1
    };
    const component = renderComponent({ ...props });
    expect(component.queryByTestId(fakeTestID)).toBeTruthy();
    expect(component.queryByText(props.title)).toBeTruthy();
    expect(component.queryByText(props.subTitle)).toBeTruthy();
  });
  it("with all props should render a FootWithButtons with close button", () => {
    const props = {
      title: "title",
      subTitle: "subTitle",
      image: 1
    };
    const component = renderComponent({ ...props });
    expect(component.queryByTestId(fakeTestID)).toBeTruthy();
    const leftCloseButton = component.queryByText(
      I18n.t("global.buttons.close")
    );
    expect(leftCloseButton).not.toBeNull();
  });
  it("with all props should render a FootWithButtons with retry button", () => {
    const props = {
      title: "title",
      subTitle: "subTitle",
      image: 1,
      retry: true
    };
    const component = renderComponent({ ...props });
    expect(component.queryByTestId(fakeTestID)).toBeTruthy();
    const leftRetryButton = component.queryByText(
      I18n.t("global.buttons.retry")
    );
    expect(leftRetryButton).not.toBeNull();
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
