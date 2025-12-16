import { createActor } from "xstate";
import { createStore } from "redux";
import { itwProximityMachine } from "../../machine/machine";
import { renderScreenWithNavigationStoreContext } from "../../../../../../utils/testWrapper";
import { appReducer } from "../../../../../../store/reducers";
import { ITW_PROXIMITY_ROUTES } from "../../navigation/routes";
import { applicationChangeState } from "../../../../../../store/actions/application";
import { ItwProximitySendDocumentsResponseScreen } from "../ItwProximitySendDocumentsResponseScreen";
import { ItwProximityMachineContext } from "../../machine/provider";

describe("ItwProximitySendDocumentsResponseScreen", () => {
  it("should match snapshot", () => {
    expect(renderComponent()).toMatchSnapshot();
  });
});

const renderComponent = () => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const initialSnapshot = createActor(itwProximityMachine).getSnapshot();

  const snapshot: typeof initialSnapshot = {
    ...initialSnapshot,
    value: "Success"
  };

  return renderScreenWithNavigationStoreContext(
    () => (
      <ItwProximityMachineContext.Provider options={{ snapshot }}>
        <ItwProximitySendDocumentsResponseScreen />
      </ItwProximityMachineContext.Provider>
    ),
    ITW_PROXIMITY_ROUTES.SEND_DOCUMENTS_RESPONSE,
    {},
    createStore(appReducer, initialState as any)
  );
};
