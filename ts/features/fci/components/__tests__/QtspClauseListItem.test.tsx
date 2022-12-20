import * as React from "react";
import { Store } from "redux";
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";
import { fireEvent } from "@testing-library/react-native";
import { mockQtspClausesMetadata } from "../../types/__mocks__/QtspClausesMetadata.mock";
import { QtspClause } from "../../../../../definitions/fci/QtspClause";
import QtspClauseListItem from "../QtspClauseListItem";
import { GlobalState } from "../../../../store/reducers/types";
import { appReducer } from "../../../../store/reducers";
import { applicationChangeState } from "../../../../store/actions/application";
import { renderScreenFakeNavRedux } from "../../../../utils/testWrapper";
import { FCI_ROUTES } from "../../navigation/routes";
import { fciLoadQtspFilledDocument } from "../../store/actions";
import { qtspFilledDocument } from "../../types/__mocks__/CreateFilledDocumentBody.mock";

type Props = {
  clause: QtspClause;
  value?: boolean;
  onChange: (_: boolean) => void;
  onLinkPress: (url: string) => void;
};

const MOCK_CLAUSE = mockQtspClausesMetadata.clauses[0];

describe("Test QtspClauseListItem component", () => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  beforeEach(() => {
    jest.useFakeTimers();
  });
  it("should render a QtspClauseListItem component with props correctly", () => {
    const mockStore = configureMockStore<GlobalState>();
    const store: ReturnType<typeof mockStore> = mockStore(globalState);

    const props = {
      clause: MOCK_CLAUSE,
      onChange: jest.fn(),
      onLinkPress: jest.fn()
    };
    const component = renderComponent({ ...props }, store);
    expect(component).toBeTruthy();
  });
  it("should render a QtspClauseListItem component with container", () => {
    const mockStore = configureMockStore<GlobalState>();
    const store: ReturnType<typeof mockStore> = mockStore(globalState);

    const props = {
      clause: MOCK_CLAUSE,
      onChange: jest.fn(),
      onLinkPress: jest.fn()
    };
    const component = renderComponent({ ...props }, store);
    expect(component).toBeTruthy();
    expect(
      component.getByTestId("QtspClauseListItemContainerTestID")
    ).toBeTruthy();
  });
  it("should render a QtspClauseListItem component with LinkedText correctly", () => {
    const mockStore = configureMockStore<GlobalState>();
    const store: ReturnType<typeof mockStore> = mockStore(globalState);

    const props = {
      clause: MOCK_CLAUSE,
      onChange: jest.fn(),
      onLinkPress: jest.fn()
    };

    store.dispatch(fciLoadQtspFilledDocument.success(qtspFilledDocument));

    const component = renderComponent({ ...props }, store);
    expect(component).toBeTruthy();
    expect(component.getByTestId("QtspClauseLinkedTextTestID")).toBeTruthy();
  });
  it("should render a QtspClauseListItem component with checkbox checked", () => {
    const mockStore = configureMockStore<GlobalState>();
    const store: ReturnType<typeof mockStore> = mockStore(globalState);

    const props = {
      clause: MOCK_CLAUSE,
      value: true,
      onChange: jest.fn(),
      onLinkPress: jest.fn()
    };
    const component = renderComponent({ ...props }, store);
    expect(component).toBeTruthy();
    expect(
      component.getByTestId("QtspClauseListItemCheckboxTestID")
    ).toBeTruthy();
    expect(component.queryAllByText("io-checkbox-on")).toBeTruthy();
  });
  it("should render a QtspClauseListItem component with checkbox clickable", () => {
    const mockStore = configureMockStore<GlobalState>();
    const store: ReturnType<typeof mockStore> = mockStore(globalState);

    const onPress = jest.fn();
    const props = {
      clause: MOCK_CLAUSE,
      value: true,
      onChange: onPress,
      onLinkPress: jest.fn()
    };
    const component = renderComponent({ ...props }, store);
    expect(component).toBeTruthy();
    const rightButton = component.getByTestId("QtspClauseListItemButtonTestID");
    expect(rightButton).toBeTruthy();
    expect(rightButton).toBeEnabled();
    fireEvent.press(rightButton);
    expect(component.queryAllByText("io-checkbox-on")).toBeTruthy();
    fireEvent.press(rightButton);
    expect(component.queryAllByText("io-checkbox-off")).toBeTruthy();
    expect(onPress).toHaveBeenCalledTimes(2);
  });
  it("should render a QtspClauseListItem component with right text for clause", () => {
    const mockStore = configureMockStore<GlobalState>();
    const store: ReturnType<typeof mockStore> = mockStore(globalState);

    const props = {
      clause: MOCK_CLAUSE,
      value: true,
      onChange: jest.fn(),
      onLinkPress: jest.fn()
    };
    const component = renderComponent({ ...props }, store);
    expect(component).toBeTruthy();
    const detailsLink = component.queryAllByText(MOCK_CLAUSE.text);
    expect(detailsLink).toBeTruthy();
  });
});

function renderComponent(props: Props, store: Store<GlobalState>) {
  const Component = (
    <Provider store={store}>
      <QtspClauseListItem {...props} />
    </Provider>
  );
  return renderScreenFakeNavRedux<GlobalState>(
    () => Component,
    FCI_ROUTES.QTSP_TOS,
    { ...props },
    store
  );
}
