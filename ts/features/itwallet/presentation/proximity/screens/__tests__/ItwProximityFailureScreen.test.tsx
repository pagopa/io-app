import { createActor } from "xstate";
import { createStore } from "redux";
import { ProximityFailure, ProximityFailureType } from "../../machine/failure";
import { itwProximityMachine } from "../../machine/machine";
import { ItwProximityMachineContext } from "../../machine/provider";
import { ItwProximityFailureScreen } from "../ItwProximityFailureScreen";
import { renderScreenWithNavigationStoreContext } from "../../../../../../utils/testWrapper";
import { GlobalState } from "../../../../../../store/reducers/types";
import { ITW_ROUTES } from "../../../../navigation/routes";
import { appReducer } from "../../../../../../store/reducers";
import { applicationChangeState } from "../../../../../../store/actions/application";
import { TimeoutError, UntrustedRpError } from "../../utils/itwProximityErrors";

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
  const initialSnapshot = createActor(itwProximityMachine).getSnapshot();

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
    createStore(appReducer, initialState as any)
  );
};
