import { ComponentProps } from "react";
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
  it("should match the snapshot with title, a subtitle, header hidden", () => {
    const defaultProps = {
      title: "Test Content Title",
      subtitle: "Test Content Subtitle"
    } as ComponentProps<typeof LoadingScreenContent>;
    expect(renderComponent(defaultProps)).toMatchSnapshot();
  });
  it("should match the snapshot with title, a subtitle, header shown", () => {
    const defaultProps = {
      title: "Test Content Title",
      subtitle: "Test Content Subtitle",
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
