import { createStore } from "redux";
import { createActor } from "xstate";

import { applicationChangeState } from "../../../../../../store/actions/application";
import { appReducer } from "../../../../../../store/reducers";
import { GlobalState } from "../../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../../utils/testWrapper";
import { testProximityDeps } from "../../../../machine/utils/testDeps";
import { ITW_ROUTES } from "../../../../navigation/routes";
import { ProximityFailure, ProximityFailureType } from "../../machine/failure";
import { itwProximityMachine } from "../../machine/machine";
import { ItwProximityMachineContext } from "../../machine/provider";
import { TimeoutError, UntrustedRpError } from "../../utils/errors";
import { ItwProximityFailureScreen } from "../ItwProximityFailureScreen";

describe("ItwProximityFailureScreen", () => {
  test.each<ProximityFailure>([
    {
      type: ProximityFailureType.RELYING_PARTY_GENERIC,
      reason: new Error("RP generic error")
    },
    {
      type: ProximityFailureType.TIMEOUT,
      reason: new TimeoutError("Request timed out")
    },
    {
      type: ProximityFailureType.UNTRUSTED_RP,
      reason: new UntrustedRpError("Untrusted RP")
    }
  ])("should render failure screen for $type", failure => {
    expect(renderComponent(failure)).toMatchSnapshot();
  });
});

const renderComponent = (failure: ProximityFailure) => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, initialState as any);
  const initialSnapshot = createActor(itwProximityMachine, {
    input: { deps: testProximityDeps({ store }) }
  }).getSnapshot();

  const snapshot: typeof initialSnapshot = {
    ...initialSnapshot,
    value: "Failure",
    context: { ...initialSnapshot.context, failure }
  };

  return renderScreenWithNavigationStoreContext<GlobalState>(
    () => (
      <ItwProximityMachineContext.Provider options={{ snapshot }}>
        <ItwProximityFailureScreen />
      </ItwProximityMachineContext.Provider>
    ),
    ITW_ROUTES.PROXIMITY.FAILURE,
    {},
    store
  );
};
