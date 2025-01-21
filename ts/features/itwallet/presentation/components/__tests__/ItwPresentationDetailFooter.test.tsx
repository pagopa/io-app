import { createStore } from "redux";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import {
  CredentialType,
  ItwStoredCredentialsMocks
} from "../../../common/utils/itwMocksUtils";
import { itwCredentialIssuanceMachine } from "../../../machine/credential/machine";
import { ItwCredentialIssuanceMachineContext } from "../../../machine/provider";
import { ITW_ROUTES } from "../../../navigation/routes";
import { ItwPresentationDetailsFooter } from "../ItwPresentationDetailsFooter";
import * as remoteConfigSelectors from "../../../common/store/selectors/remoteConfig";

describe("ItwPresentationDetailsFooter", () => {
  it("should render actions", () => {
    const { queryByTestId } = renderComponent(
      CredentialType.EUROPEAN_HEALTH_INSURANCE_CARD
    );

    expect(queryByTestId("requestAssistanceActionTestID")).not.toBeNull();
    expect(queryByTestId("removeCredentialActionTestID")).not.toBeNull();
    expect(queryByTestId("openIPatenteActionTestID")).toBeNull();
  });

  it("should render iPatente action", () => {
    jest
      .spyOn(remoteConfigSelectors, "itwIsIPatenteCtaEnabledSelector")
      .mockImplementation(() => true);

    const { queryByTestId } = renderComponent(CredentialType.DRIVING_LICENSE);

    expect(queryByTestId("requestAssistanceActionTestID")).not.toBeNull();
    expect(queryByTestId("removeCredentialActionTestID")).not.toBeNull();
    expect(queryByTestId("openIPatenteActionTestID")).not.toBeNull();
  });
});

const renderComponent = (credentialType: CredentialType) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));

  const logic = itwCredentialIssuanceMachine.provide({
    actions: {
      onInit: jest.fn()
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
