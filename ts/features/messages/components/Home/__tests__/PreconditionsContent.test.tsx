import React from "react";
import { constUndefined } from "fp-ts/lib/function";
import { createStore } from "redux";
import { appReducer } from "../../../../../store/reducers";
import { applicationChangeState } from "../../../../../store/actions/application";
import { preferencesDesignSystemSetEnabled } from "../../../../../store/actions/persistedPreferences";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { PreconditionsContent } from "../PreconditionsContent";
import { MESSAGES_ROUTES } from "../../../navigation/routes";
import * as messagePreconditions from "../../../store/reducers/messagePrecondition";
import * as backendStatus from "../../../../../store/reducers/backendStatus";

describe("PreconditionsContent", () => {
  afterEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
  });
  it("should match snapshot when content category is 'content' but markdown is undefined", () => {
    jest
      .spyOn(messagePreconditions, "preconditionsContentSelector")
      .mockImplementation(_ => "content");
    jest
      .spyOn(messagePreconditions, "preconditionsContentMarkdownSelector")
      .mockImplementation(constUndefined);
    const component = renderComponent();
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot when content category is 'content' and markdown is defined", () => {
    jest
      .spyOn(messagePreconditions, "preconditionsContentSelector")
      .mockImplementation(_ => "content");
    jest
      .spyOn(messagePreconditions, "preconditionsContentMarkdownSelector")
      .mockImplementation(_ => "A markdown content");
    const component = renderComponent();
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot when content category is 'error'", () => {
    jest
      .spyOn(messagePreconditions, "preconditionsContentSelector")
      .mockImplementation(_ => "error");
    const component = renderComponent();
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot when content category is 'loading'", () => {
    jest
      .spyOn(messagePreconditions, "preconditionsContentSelector")
      .mockImplementation(_ => "loading");
    const component = renderComponent();
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot when content category is 'update' and SEND min app version is '1.0.0.0'", () => {
    jest
      .spyOn(messagePreconditions, "preconditionsContentSelector")
      .mockImplementation(_ => "update");
    jest
      .spyOn(backendStatus, "pnMinAppVersionSelector")
      .mockImplementation(_ => "1.0.0.0");
    const component = renderComponent();
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot when content category is undefined", () => {
    jest
      .spyOn(messagePreconditions, "preconditionsContentSelector")
      .mockImplementation(constUndefined);
    const component = renderComponent();
    expect(component.toJSON()).toMatchSnapshot();
  });
  /* it("should dispatch", () => {
    jest
      .spyOn(messagePreconditions, "preconditionsContentSelector")
      .mockImplementation(_ => "content");
    jest
      .spyOn(messagePreconditions, "preconditionsContentMarkdownSelector")
      .mockImplementation(_ => "A markdown content");
    const component = renderComponent();
    const messageMarkdown = component.getByTestId(
      "preconditions_content_message_markdown"
    );
    console.log(Object.keys(messageMarkdown.props));
    console.log(messageMarkdown.props.testID);
  }); */
});

const renderComponent = () => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const designSystemState = appReducer(
    initialState,
    preferencesDesignSystemSetEnabled({ isDesignSystemEnabled: true })
  );
  const store = createStore(appReducer, designSystemState as any);

  return renderScreenWithNavigationStoreContext(
    () => <PreconditionsContent />,
    MESSAGES_ROUTES.MESSAGES_HOME,
    {},
    store
  );
};
