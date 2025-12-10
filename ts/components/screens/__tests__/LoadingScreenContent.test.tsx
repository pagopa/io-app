import { ComponentProps } from "react";
import { Text } from "react-native";
import { createStore } from "redux";
import { applicationChangeState } from "../../../store/actions/application";
import { appReducer } from "../../../store/reducers";
import { GlobalState } from "../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../utils/testWrapper";
import LoadingScreenContent from "../LoadingScreenContent";

describe("LoadingScreenContent", () => {
  it("should match the snapshot with title, no children, header hidden", () => {
    const defaultProps = {
      title: "Test Content Title"
    } as ComponentProps<typeof LoadingScreenContent>;
    expect(renderComponent(defaultProps)).toMatchSnapshot();
  });
  it("should match the snapshot with title, no children, header shown", () => {
    const defaultProps = {
      title: "Test Content Title",
      headerVisible: true
    } as ComponentProps<typeof LoadingScreenContent>;
    expect(renderComponent(defaultProps)).toMatchSnapshot();
  });
  it("should match the snapshot with title, a child, header hidden", () => {
    const defaultProps = {
      title: "Test Content Title",
      children: <Text>{"My test child"}</Text>
    } as ComponentProps<typeof LoadingScreenContent>;
    expect(renderComponent(defaultProps)).toMatchSnapshot();
  });
  it("should match the snapshot with title, a child, header shown", () => {
    const defaultProps = {
      title: "Test Content Title",
      children: <Text>{"My test child"}</Text>,
      headerVisible: true
    } as ComponentProps<typeof LoadingScreenContent>;
    expect(renderComponent(defaultProps)).toMatchSnapshot();
  });
});

function renderComponent(props: ComponentProps<typeof LoadingScreenContent>) {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  return renderScreenWithNavigationStoreContext<GlobalState>(
    () => <LoadingScreenContent {...props} />,
    "DUMMY ROUTE",
    {},
    createStore(appReducer, globalState as any)
  );
}
