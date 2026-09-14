import { RenderAPI } from "@testing-library/react-native";
import { createStore, Store } from "redux";

import { isLoading } from "../../../../common/model/RemoteValue";
import ROUTES from "../../../../navigation/routes";
import { applicationChangeState } from "../../../../store/actions/application";
import { appReducer } from "../../../../store/reducers";
import { GlobalState } from "../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import ZendeskSupportHelpCenter from "../ZendeskSupportHelpCenter";

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
