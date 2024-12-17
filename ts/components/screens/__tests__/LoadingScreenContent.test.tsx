import * as React from "react";
import { Text } from "react-native";
import { createStore } from "redux";
import LoadingScreenContent from "../LoadingScreenContent";
import { appReducer } from "../../../store/reducers";
import { applicationChangeState } from "../../../store/actions/application";
import { renderScreenWithNavigationStoreContext } from "../../../utils/testWrapper";
import { GlobalState } from "../../../store/reducers/types";
import { preferencesDesignSystemSetEnabled } from "../../../store/actions/persistedPreferences";

describe("LoadingScreenContent", () => {
  it("should match the snapshot with title, no children, header hidden", () => {
    const defaultProps = {
      contentTitle: "Test Content Title"
    } as React.ComponentProps<typeof LoadingScreenContent>;
    expect(renderComponent(defaultProps)).toMatchSnapshot();
  });
  it("should match the snapshot with title, no children, header shown", () => {
    const defaultProps = {
      contentTitle: "Test Content Title",
      headerVisible: true
    } as React.ComponentProps<typeof LoadingScreenContent>;
    expect(renderComponent(defaultProps)).toMatchSnapshot();
  });
  it("should match the snapshot with title, a child, header hidden", () => {
    const defaultProps = {
      contentTitle: "Test Content Title",
      children: <Text>{"My test child"}</Text>
    } as React.ComponentProps<typeof LoadingScreenContent>;
    expect(renderComponent(defaultProps)).toMatchSnapshot();
  });
  it("should match the snapshot with title, a child, header shown", () => {
    const defaultProps = {
      contentTitle: "Test Content Title",
      children: <Text>{"My test child"}</Text>,
      headerVisible: true
    } as React.ComponentProps<typeof LoadingScreenContent>;
    expect(renderComponent(defaultProps)).toMatchSnapshot();
  });
});

function renderComponent(
  props: React.ComponentProps<typeof LoadingScreenContent>
) {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const designSystemEnabledState = appReducer(
    globalState,
    preferencesDesignSystemSetEnabled({ isDesignSystemEnabled: true })
  );
  return renderScreenWithNavigationStoreContext<GlobalState>(
    () => <LoadingScreenContent {...props} />,
    "DUMMY ROUTE",
    {},
    createStore(appReducer, designSystemEnabledState as any)
  );
}
