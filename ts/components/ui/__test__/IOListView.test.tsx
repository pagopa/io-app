import { Body } from "@pagopa/io-app-design-system";
import { ComponentProps } from "react";
import { createStore } from "redux";
import ROUTES from "../../../navigation/routes";
import { applicationChangeState } from "../../../store/actions/application";
import { appReducer } from "../../../store/reducers";
import { GlobalState } from "../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../utils/testWrapper";
import { IOListView } from "../IOListView";

type Data = { id: string; name: string };
const renderComponent = (props: ComponentProps<typeof IOListView<Data>>) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  return renderScreenWithNavigationStoreContext<GlobalState>(
    () => <IOListView {...props} />,
    ROUTES.WALLET_HOME,
    {},
    createStore(appReducer, globalState as any)
  );
};

const defaultProps: ComponentProps<typeof IOListView<Data>> = {
  data: [
    { id: "1", name: "Item 1" },
    { id: "2", name: "Item 2" }
  ],
  keyExtractor: item => item.id,
  renderItem: ({ item }) => <Body>{item.name}</Body>
};

describe("IOListView", () => {
  it("should render correctly", () => {
    const { getByText } = renderComponent(defaultProps);
    expect(getByText("Item 1")).toBeTruthy();
    expect(getByText("Item 2")).toBeTruthy();
  });

  it("should render loading state", () => {
    const props = {
      ...defaultProps,
      skeleton: <Body>Skeleton</Body>,
      loading: true
    };
    const { getAllByText } = renderComponent(props);
    expect(getAllByText("Skeleton")).toHaveLength(2);
  });
});
