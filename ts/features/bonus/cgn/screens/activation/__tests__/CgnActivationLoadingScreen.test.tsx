import { createStore } from "redux";
import I18n from "i18next";
import { applicationChangeState } from "../../../../../../store/actions/application";
import { Store } from "../../../../../../store/actions/types";
import { appReducer } from "../../../../../../store/reducers";
import { GlobalState } from "../../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../../utils/testWrapper";
import CGN_ROUTES from "../../../navigation/routes";
import { cgnRequestActivation } from "../../../store/actions/activation";
import CgnActivationLoadingScreen from "../CgnActivationLoadingScreen";

const renderComponent = (store: Store) =>
  renderScreenWithNavigationStoreContext<GlobalState>(
    () => <CgnActivationLoadingScreen />,
    CGN_ROUTES.ACTIVATION.LOADING,
    {},
    store
  );

describe("CgnActivationLoadingScreen", () => {
  it("renders LoadingComponent when isLoading is true", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);

    const { getByText, getByRole } = renderComponent(store);

    store.dispatch(cgnRequestActivation());
    expect(getByRole("header")).toBeTruthy();
    expect(
      getByText(I18n.t("bonus.cgn.activation.loading.caption"))
    ).toBeTruthy();
    expect(
      getByText(I18n.t("bonus.cgn.activation.loading.subCaption"))
    ).toBeTruthy();
  });
});
