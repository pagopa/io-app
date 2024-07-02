import * as React from "react";
import { createStore } from "redux";
import { ItwDiscoveryInfoScreen } from "../ItwDiscoveryInfoScreen";
import { ITW_ROUTES } from "../../../navigation/routes";
import { appReducer } from "../../../../../store/reducers";
import { applicationChangeState } from "../../../../../store/actions/application";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { GlobalState } from "../../../../../store/reducers/types";
import {
  ItwEidIssuanceMachineContext,
  ItwCredentialIssuanceMachineContext
} from "../../../machine/provider";
import { itwEidIssuanceMachine } from "../../../machine/eid/machine";

describe("Test ItwDiscoveryInfo screen", () => {
  it("it should render the screen correctly", () => {
    const component = renderComponent();
    expect(component).toBeTruthy();
  });
});

const renderComponent = () => {
  const globalState = appReducer(undefined, applicationChangeState("active"));

  const logic = itwEidIssuanceMachine.provide({
    actions: {
      navigateToTosScreen: () => undefined
    }
  });

  return renderScreenWithNavigationStoreContext<GlobalState>(
    () => (
      <ItwEidIssuanceMachineContext.Provider logic={logic}>
        <ItwCredentialIssuanceMachineContext.Provider>
          <ItwDiscoveryInfoScreen />
        </ItwCredentialIssuanceMachineContext.Provider>
      </ItwEidIssuanceMachineContext.Provider>
    ),
    ITW_ROUTES.DISCOVERY.INFO,
    {},
    createStore(appReducer, globalState as any)
  );
};
