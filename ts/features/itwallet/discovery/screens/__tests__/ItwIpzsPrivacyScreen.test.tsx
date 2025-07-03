import { createStore } from "redux";
import { createActor } from "xstate";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { itwEidIssuanceMachine } from "../../../machine/eid/machine";
import { ItwEidIssuanceMachineContext } from "../../../machine/provider";
import { ITW_ROUTES } from "../../../navigation/routes";
import ItwIpzsPrivacyScreen from "../ItwIpzsPrivacyScreen";

describe("ItwIpzsPrivacyScreen", () => {
  it("should match the snapshot (L3 disabled)", () => {
    const component = renderComponent(false);
    expect(component).toMatchSnapshot();
  });

  it("should match the snapshot (L3 enabled)", () => {
    const component = renderComponent(true);
    expect(component).toMatchSnapshot();
  });
});

const renderComponent = (isL3FeaturesEnabled: boolean) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));

  const logic = itwEidIssuanceMachine.provide({
    actions: {
      onInit: jest.fn(),
      navigateToTosScreen: () => undefined
    }
  });

  const initialSnapshot = createActor(itwEidIssuanceMachine).getSnapshot();
  const snapshot: typeof initialSnapshot = {
    ...initialSnapshot,
    value: "IpzsPrivacyAcceptance",
    context: {
      ...initialSnapshot.context,
      isL3FeaturesEnabled
    }
  };

  return renderScreenWithNavigationStoreContext<GlobalState>(
    () => (
      <ItwEidIssuanceMachineContext.Provider
        logic={logic}
        options={{ snapshot }}
      >
        <ItwIpzsPrivacyScreen />
      </ItwEidIssuanceMachineContext.Provider>
    ),
    ITW_ROUTES.DISCOVERY.IPZS_PRIVACY,
    {},
    createStore(appReducer, globalState as any)
  );
};
