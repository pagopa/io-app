import { createActor } from "xstate";
import { createStore } from "redux";
import { itwRemoteMachine } from "../../machine/machine";
import { renderScreenWithNavigationStoreContext } from "../../../../../../utils/testWrapper";
import { appReducer } from "../../../../../../store/reducers";
import { ItwRemoteMachineContext } from "../../machine/provider";
import { ItwRemoteAuthResponseScreen } from "../ItwRemoteAuthResponseScreen";
import { ITW_REMOTE_ROUTES } from "../../navigation/routes";
import { applicationChangeState } from "../../../../../../store/actions/application";

describe("ItwRemoteAuthResponseScreen", () => {
  it("should match snapshot when no redirect_uri is available", () => {
    expect(renderComponent()).toMatchSnapshot();
  });

  it("should match snapshot when a redirect_uri is available", () => {
    expect(renderComponent("https://myrp/auth/success")).toMatchSnapshot();
  });
});

const renderComponent = (redirectUri?: string) => {
  const initialSnapshot = createActor(itwRemoteMachine).getSnapshot();
  const initialState = appReducer(undefined, applicationChangeState("active"));

  const snapshot: typeof initialSnapshot = {
    ...initialSnapshot,
    value: "Success",
    context: {
      ...initialSnapshot.context,
      redirectUri
    }
  };

  return renderScreenWithNavigationStoreContext(
    () => (
      <ItwRemoteMachineContext.Provider options={{ snapshot }}>
        <ItwRemoteAuthResponseScreen />
      </ItwRemoteMachineContext.Provider>
    ),
    ITW_REMOTE_ROUTES.AUTH_RESPONSE,
    {},
    createStore(appReducer, initialState as any)
  );
};
