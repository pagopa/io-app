import * as React from "react";
import { createStore } from "redux";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { ITW_ROUTES } from "../../../navigation/routes";
import { ItwIssuanceCredentialTrustIssuerScreen } from "../ItwIssuanceCredentialTrustIssuerScreen";
import { ItwCredentialIssuanceMachineContext } from "../../../machine/provider";

describe("ItwIssuanceCredentialTrustIssuerScreen", () => {
  it("it should render the screen correctly", () => {
    const component = renderComponent();
    expect(component).toBeTruthy();
  });
});

const renderComponent = () => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  return renderScreenWithNavigationStoreContext<GlobalState>(
    () => (
      <ItwCredentialIssuanceMachineContext.Provider>
        <ItwIssuanceCredentialTrustIssuerScreen />
      </ItwCredentialIssuanceMachineContext.Provider>
    ),
    ITW_ROUTES.ISSUANCE.CREDENTIAL_TRUST_ISSUER,
    {},
    createStore(appReducer, globalState as any)
  );
};
