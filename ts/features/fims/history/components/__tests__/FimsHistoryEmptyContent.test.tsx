import { createStore } from "redux";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { FIMS_ROUTES } from "../../../common/navigation";
import { FimsHistoryEmptyContent } from "../FimsHistoryEmptyContent";

jest.mock("../FimsHistoryHeaderComponent.tsx");

describe("fimsHistoryEmptyContent", () => {
  it("should match snapshot", () => {
    const component = renderComponent();
    expect(component.toJSON()).toMatchSnapshot();
  });
});
const renderComponent = () =>
  renderScreenWithNavigationStoreContext<GlobalState>(
    FimsHistoryEmptyContent,
    FIMS_ROUTES.HISTORY,
    {},
    createStore(appReducer, applicationChangeState("active") as any)
  );
