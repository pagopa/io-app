import * as React from "react";
import { createStore } from "redux";
import ItwDiscoveryInfoScreen from "../ItwDiscoveryInfoScreen";
import { ITW_ROUTES } from "../../../navigation/routes";
import { appReducer } from "../../../../../store/reducers";
import { applicationChangeState } from "../../../../../store/actions/application";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { GlobalState } from "../../../../../store/reducers/types";

describe("Test ItwDiscoveryInfo screen", () => {
  it("it should render the screen correctly", () => {
    const component = renderComponent();
    expect(component).toBeTruthy();
  });
});

const renderComponent = () => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  return renderScreenWithNavigationStoreContext<GlobalState>(
    () => <ItwDiscoveryInfoScreen />,
    ITW_ROUTES.DISCOVERY.INFO,
    {},
    createStore(appReducer, globalState as any)
  );
};
