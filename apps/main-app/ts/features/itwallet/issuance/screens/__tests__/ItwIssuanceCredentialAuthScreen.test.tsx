import { createStore } from "redux";

import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { CredentialIssuanceMachineDeps } from "../../../machine/credential/input";
import { itwCredentialIssuanceMachine } from "../../../machine/credential/machine";
import { ItwCredentialIssuanceMachineContext } from "../../../machine/credential/provider";
import { ITW_ROUTES } from "../../../navigation/routes";
import { ItwIssuanceCredentialTrustIssuerScreen } from "../ItwIssuanceCredentialTrustIssuerScreen";

jest.mock("../../../../../utils/hooks/usePreventScreenCapture", () => ({
  usePreventScreenCapture: jest.fn()
}));

describe("ItwIssuanceCredentialTrustIssuerScreen", () => {
  it("should render the screen correctly", () => {
    const component = renderComponent();
    expect(component).toBeTruthy();
  });
});

const renderComponent = () => {
  const globalState = appReducer(undefined, applicationChangeState("active"));

  const logic = itwCredentialIssuanceMachine.provide({
    actions: {
      onInit: jest.fn()
    }
  });

  return renderScreenWithNavigationStoreContext<GlobalState>(
    () => (
      <ItwCredentialIssuanceMachineContext.Provider
        logic={logic}
        options={{ input: { deps: {} as CredentialIssuanceMachineDeps } }}
      >
        <ItwIssuanceCredentialTrustIssuerScreen />
      </ItwCredentialIssuanceMachineContext.Provider>
    ),
    ITW_ROUTES.ISSUANCE.CREDENTIAL_TRUST_ISSUER,
    {},
    createStore(appReducer, globalState as any)
  );
};
