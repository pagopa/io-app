import * as React from "react";
import { createStore } from "redux";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { ITW_ROUTES } from "../../../navigation/routes";
import { ItwIssuanceCredentialAuthScreen } from "../ItwIssuanceCredentialTrustIssuerScreen";

describe("ItwIssuanceCredentialAuthScreen", () => {
  it("it should render the screen correctly", () => {
    const component = renderComponent();
    expect(component).toBeTruthy();
  });
});

const renderComponent = () => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  return renderScreenWithNavigationStoreContext<GlobalState>(
    () => <ItwIssuanceCredentialAuthScreen />,
    ITW_ROUTES.ISSUANCE.CREDENTIAL_AUTH,
    {},
    createStore(appReducer, globalState as any)
  );
};
