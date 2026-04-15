import { createStore } from "redux";
import { createActor } from "xstate";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { EidIssuanceLevel } from "../../../machine/eid/context";
import { itwEidIssuanceMachine } from "../../../machine/eid/machine";
import { ItwEidIssuanceMachineContext } from "../../../machine/eid/provider";
import { ITW_ROUTES } from "../../../navigation/routes";
import ItwIpzsPrivacyScreen from "../ItwIpzsPrivacyScreen";

describe("ItwIpzsPrivacyScreen", () => {
  it("should match the snapshot (L3 disabled)", () => {
    const component = renderComponent("l2");
    expect(component).toMatchSnapshot();
  });

  it("should match the snapshot (L3 enabled)", () => {
    const component = renderComponent("l3");
    expect(component).toMatchSnapshot();
  });
});

const renderComponent = (level: EidIssuanceLevel) => {
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
      level
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
