import React from "react";
import { constUndefined } from "fp-ts/lib/function";
import { createStore } from "redux";
import { applicationChangeState } from "../../../../../store/actions/application";
import { preferencesDesignSystemSetEnabled } from "../../../../../store/actions/persistedPreferences";
import { appReducer } from "../../../../../store/reducers";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { PreconditionsTitle } from "../PreconditionsTitle";
import { MESSAGES_ROUTES } from "../../../navigation/routes";
import * as messagePreconditions from "../../../store/reducers/messagePrecondition";

describe("PreconditionsTitle", () => {
  afterEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
  });
  it("should match snapshot when title content is 'empty'", () => {
    jest
      .spyOn(messagePreconditions, "preconditionsTitleContentSelector")
      .mockImplementation(_ => "empty");
    const component = renderComponent();
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot when title content is 'loading'", () => {
    jest
      .spyOn(messagePreconditions, "preconditionsTitleContentSelector")
      .mockImplementation(_ => "loading");
    const component = renderComponent();
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot when title content is 'header' but title is undefined", () => {
    jest
      .spyOn(messagePreconditions, "preconditionsTitleContentSelector")
      .mockImplementation(_ => "header");
    jest
      .spyOn(messagePreconditions, "preconditionsTitleSelector")
      .mockImplementation(constUndefined);
    const component = renderComponent();
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot when title content is 'header' and title is defined", () => {
    jest
      .spyOn(messagePreconditions, "preconditionsTitleContentSelector")
      .mockImplementation(_ => "header");
    jest
      .spyOn(messagePreconditions, "preconditionsTitleSelector")
      .mockImplementation(_ => "This is a title");
    const component = renderComponent();
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot when title content is undefined", () => {
    jest
      .spyOn(messagePreconditions, "preconditionsTitleContentSelector")
      .mockImplementation(constUndefined);
    const component = renderComponent();
    expect(component.toJSON()).toMatchSnapshot();
  });
});

const renderComponent = () => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const designSystemState = appReducer(
    initialState,
    preferencesDesignSystemSetEnabled({ isDesignSystemEnabled: true })
  );
  const store = createStore(appReducer, designSystemState as any);

  return renderScreenWithNavigationStoreContext(
    () => <PreconditionsTitle />,
    MESSAGES_ROUTES.MESSAGES_HOME,
    {},
    store
  );
};
