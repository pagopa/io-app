import {
  Errors,
  RemotePresentation,
  Trust
} from "@pagopa/io-react-native-wallet";
import { constTrue } from "fp-ts/lib/function";
import { createStore } from "redux";
import { createActor } from "xstate";

import { applicationChangeState } from "../../../../../../store/actions/application";
import { appReducer } from "../../../../../../store/reducers";
import { GlobalState } from "../../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../../utils/testWrapper";
import * as itwCommonSelectors from "../../../../common/store/selectors";
import { RemoteFailure, RemoteFailureType } from "../../machine/failure";
import { itwRemoteMachine } from "../../machine/machine";
import { ItwRemoteMachineContext } from "../../machine/provider";
import { ITW_REMOTE_ROUTES } from "../../navigation/routes";
import { ItwRemoteFailureScreen } from "../ItwRemoteFailureScreen";

describe("ItwRemoteFailureScreen", () => {
  test.each<RemoteFailure>([
    {
      type: RemoteFailureType.INVALID_CREDENTIALS_STATUS,
      reason: { invalidCredentials: ["mDL"] }
    },
    {
      type: RemoteFailureType.INVALID_CREDENTIALS_STATUS,
      reason: { invalidCredentials: ["mDL", "EuropeanDisabilityCard"] }
    },
    {
      type: RemoteFailureType.MISSING_CREDENTIALS,
      reason: { missingCredentials: ["mDL"] }
    },
    {
      type: RemoteFailureType.MISSING_CREDENTIALS,
      reason: { missingCredentials: ["mDL", "EuropeanDisabilityCard"] }
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
      reason: new Error() as RemotePresentation.Errors.InvalidRequestObjectError
    },
    {
      type: RemoteFailureType.UNTRUSTED_RP,
      reason: new Error() as Trust.Errors.FederationError
    }
  ])("should render failure screen for $type", failure => {
    jest
      .spyOn(itwCommonSelectors, "itwIsL3EnabledSelector")
      .mockImplementation(constTrue);
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
