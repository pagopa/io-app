import { createCryptoContextFor } from "@pagopa/io-react-native-wallet";
import * as React from "react";
import { createStore } from "redux";
import { fromPromise } from "xstate";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import {
  CredentialType,
  ItwStoredCredentialsMocks
} from "../../../common/utils/itwMocksUtils";
import { OnInitActorOutput } from "../../../machine/credential/actors";
import { itwCredentialIssuanceMachine } from "../../../machine/credential/machine";
import { ItwCredentialIssuanceMachineContext } from "../../../machine/provider";
import { ITW_ROUTES } from "../../../navigation/routes";
import { ItwPresentationDetailsFooter } from "../ItwPresentationDetailsFooter";

describe("ItwPresentationAlertsSection", () => {
  test.each([
    CredentialType.DRIVING_LICENSE,
    CredentialType.EUROPEAN_DISABILITY_CARD,
    CredentialType.EUROPEAN_HEALTH_INSURANCE_CARD
  ])(
    "should render the remove credential action if credential type is %p",
    credentialType => {
      const { queryByTestId } = renderComponent(credentialType);

      expect(queryByTestId("removeCredentialActionTestID")).not.toBeNull();
    }
  );

  it("should not render the remove credential action if credential is EID", () => {
    const { queryByTestId } = renderComponent(CredentialType.PID);

    expect(queryByTestId("removeCredentialActionTestID")).toBeNull();
  });
});

const renderComponent = (credentialType: CredentialType) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));

  const logic = itwCredentialIssuanceMachine.provide({
    actors: {
      onInit: fromPromise<OnInitActorOutput>(async () => ({
        integrityKeyTag: "",
        walletInstanceAttestation: "",
        wiaCryptoContext: createCryptoContextFor("")
      }))
    }
  });

  return renderScreenWithNavigationStoreContext<GlobalState>(
    () => (
      <ItwCredentialIssuanceMachineContext.Provider logic={logic}>
        <ItwPresentationDetailsFooter
          credential={{
            ...ItwStoredCredentialsMocks.dc,
            credentialType
          }}
        />
      </ItwCredentialIssuanceMachineContext.Provider>
    ),
    ITW_ROUTES.PRESENTATION.CREDENTIAL_DETAIL,
    {},
    createStore(appReducer, globalState as any)
  );
};
