import { createStore } from "redux";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { itwEidIssuanceMachine } from "../../../machine/eid/machine";
import { ItwEidIssuanceMachineContext } from "../../../machine/provider";
import { ITW_ROUTES } from "../../../navigation/routes";
import { ItwDiscoveryInfoScreen } from "../ItwDiscoveryInfoScreen";

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
      onInit: jest.fn(),
      navigateToTosScreen: () => undefined
    }
  });

  return renderScreenWithNavigationStoreContext<GlobalState>(
    () => (
      <ItwEidIssuanceMachineContext.Provider logic={logic}>
        <ItwDiscoveryInfoScreen />
      </ItwEidIssuanceMachineContext.Provider>
    ),
    ITW_ROUTES.DISCOVERY.INFO,
    {},
    createStore(appReducer, globalState as any)
  );
};
