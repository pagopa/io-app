import { createStore } from "redux";
import I18n from "../../../../../../../i18n";
import { applicationChangeState } from "../../../../../../../store/actions/application";
import { appReducer } from "../../../../../../../store/reducers";
import { renderScreenWithNavigationStoreContext } from "../../../../../../../utils/testWrapper";
import LoadTransactions from "../LoadTransactions";

describe("LoadTransactions component", () => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, globalState as any);
  it("should show the activity indicator", () => {
    const component = renderScreenWithNavigationStoreContext(
      LoadTransactions,
      "DUMMY",
      {},
      store
    );
    const activityIndicator = component.queryByTestId("activityIndicator");

    expect(activityIndicator).not.toBe(null);
  });
  it("should show the right title", () => {
    const component = renderScreenWithNavigationStoreContext(
      LoadTransactions,
      "DUMMY",
      {},
      store
    );
    const title = component.getByText(
      I18n.t("bonus.bpd.details.transaction.loading")
    );

    expect(title).not.toBeEmpty();
  });
});
