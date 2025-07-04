import { createActor } from "xstate";
import { createStore } from "redux";
import { Credential, Errors } from "@pagopa/io-react-native-wallet";
import { FederationError } from "@pagopa/io-react-native-wallet-v2/src/trust/errors";
import { RemoteFailure, RemoteFailureType } from "../../machine/failure";
import { itwRemoteMachine } from "../../machine/machine";
import { ItwRemoteMachineContext } from "../../machine/provider";
import { ItwRemoteFailureScreen } from "../ItwRemoteFailureScreen";
import { renderScreenWithNavigationStoreContext } from "../../../../../../utils/testWrapper";
import { GlobalState } from "../../../../../../store/reducers/types";
import { ITW_REMOTE_ROUTES } from "../../navigation/routes";
import { appReducer } from "../../../../../../store/reducers";
import { applicationChangeState } from "../../../../../../store/actions/application";

describe("ItwRemoteFailureScreen", () => {
  test.each<RemoteFailure>([
    {
      type: RemoteFailureType.INVALID_CREDENTIALS_STATUS,
      reason: { invalidCredentials: ["MDL"] }
    },
    {
      type: RemoteFailureType.INVALID_CREDENTIALS_STATUS,
      reason: { invalidCredentials: ["MDL", "EuropeanDisabilityCard"] }
    },
    {
      type: RemoteFailureType.MISSING_CREDENTIALS,
      reason: { missingCredentials: ["MDL"] }
    },
    {
      type: RemoteFailureType.MISSING_CREDENTIALS,
      reason: { missingCredentials: ["MDL", "EuropeanDisabilityCard"] }
    },
    { type: RemoteFailureType.WALLET_INACTIVE, reason: "" },
    { type: RemoteFailureType.EID_EXPIRED, reason: "" },
    {
      type: RemoteFailureType.RELYING_PARTY_INVALID_AUTH_RESPONSE,
      reason: new Error() as Errors.RelyingPartyResponseError
    },
    {
      type: RemoteFailureType.RELYING_PARTY_GENERIC,
      reason: new Error() as Errors.RelyingPartyResponseError
    },
    {
      type: RemoteFailureType.INVALID_REQUEST_OBJECT,
      reason:
        new Error() as Credential.Presentation.Errors.InvalidRequestObjectError
    },
    {
      type: RemoteFailureType.UNTRUSTED_RP,
      reason: new Error() as FederationError
    }
  ])("should render failure screen for $type", failure => {
    expect(renderComponent(failure)).toMatchSnapshot();
  });
});

const renderComponent = (failure: RemoteFailure) => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const initialSnapshot = createActor(itwRemoteMachine).getSnapshot();

  const snapshot: typeof initialSnapshot = {
    ...initialSnapshot,
    value: "Failure",
    context: { ...initialSnapshot.context, failure }
  };

  return renderScreenWithNavigationStoreContext<GlobalState>(
    () => (
      <ItwRemoteMachineContext.Provider options={{ snapshot }}>
        <ItwRemoteFailureScreen />
      </ItwRemoteMachineContext.Provider>
    ),
    ITW_REMOTE_ROUTES.FAILURE,
    {},
    createStore(appReducer, initialState as any)
  );
};
