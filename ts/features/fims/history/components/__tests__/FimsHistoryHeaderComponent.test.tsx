import { createStore } from "redux";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { FimsHistoryHeaderComponent } from "../FimsHistoryHeaderComponent";
import { FIMS_ROUTES } from "../../../common/navigation";

describe("FimsHistoryHeaderComponent", () => {
  it("should match snapshot", () => {
    expect(renderComponent().toJSON()).toMatchSnapshot();
  });
});

const renderComponent = () =>
  renderScreenWithNavigationStoreContext<GlobalState>(
    FimsHistoryHeaderComponent,
    FIMS_ROUTES.HISTORY,
    {},
    createStore(appReducer, applicationChangeState("active") as any)
  );
