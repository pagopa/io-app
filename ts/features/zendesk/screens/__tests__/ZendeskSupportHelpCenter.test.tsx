import { createStore, Store } from "redux";
import { RenderAPI } from "@testing-library/react-native";
import { appReducer } from "../../../../store/reducers";
import { applicationChangeState } from "../../../../store/actions/application";
import { GlobalState } from "../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import ROUTES from "../../../../navigation/routes";
import ZendeskSupportHelpCenter from "../ZendeskSupportHelpCenter";
import { isLoading } from "../../../../common/model/RemoteValue";

jest.useFakeTimers();

describe("the ZendeskSupportHelpCenter screen", () => {
  const globalState = appReducer(undefined, applicationChangeState("active"));

  it("should call the getZendeskConfig.request when is mounted", () => {
    const store: Store<GlobalState> = createStore(
      appReducer,
      globalState as any
    );
    renderComponent(store);
    expect(
      isLoading(store.getState().assistanceTools.zendesk.zendeskConfig)
    ).toBeTruthy();
  });
  it("should render it", () => {
    const store: Store<GlobalState> = createStore(
      appReducer,
      globalState as any
    );
    const component: RenderAPI = renderComponent(store);

    expect(
      component.queryByTestId("ZendeskSupportHelpCenterScreen")
    ).toBeDefined();
  });
});

function renderComponent(store: Store<GlobalState>) {
  return renderScreenWithNavigationStoreContext<GlobalState>(
    ZendeskSupportHelpCenter,
    ROUTES.MAIN,
    {},
    store
  );
}
