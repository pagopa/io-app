import { createStore } from "redux";
import { applicationChangeState } from "../../../../store/actions/application";
import { appReducer } from "../../../../store/reducers";
import { GlobalState } from "../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import DESIGN_SYSTEM_ROUTES from "../../navigation/routes";
import { DSIOListViewWithLargeHeader } from "../DSIOListViewWithLargeHeader";

const renderComponent = () => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  return renderScreenWithNavigationStoreContext<GlobalState>(
    () => <DSIOListViewWithLargeHeader />,
    DESIGN_SYSTEM_ROUTES.SCREENS.IOLISTVIEW_LARGE_HEADER.route,
    {},
    createStore(appReducer, globalState as any)
  );
};

describe("DSIOListViewWithLargeHeader", () => {
  it("should render list items correctly", () => {
    const { getByTestId } = renderComponent();
    expect(getByTestId("io-list-view-large-header")).toBeTruthy();
  });
});
