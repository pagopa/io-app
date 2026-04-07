import { createStore } from "redux";
import { createActor } from "xstate";

import { applicationChangeState } from "../../../../../../store/actions/application";
import { appReducer } from "../../../../../../store/reducers";
import { renderScreenWithNavigationStoreContext } from "../../../../../../utils/testWrapper";
import { itwProximityMachine } from "../../machine/machine";
import { ItwProximityMachineContext } from "../../machine/provider";
import { ITW_PROXIMITY_ROUTES } from "../../navigation/routes";
import { ItwProximitySendDocumentsResponseScreen } from "../ItwProximitySendDocumentsResponseScreen";

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
