import { createStore } from "redux";
import { applicationChangeState } from "../../../../../../store/actions/application";
import { appReducer } from "../../../../../../store/reducers";
import { GlobalState } from "../../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../../utils/testWrapper";
import {
  CredentialType,
  ItwStoredCredentialsMocks
} from "../../../../common/utils/itwMocksUtils";
import { ITW_ROUTES } from "../../../../navigation/routes";
import { ItwPresentationAdditionalInfoSection } from "../ItwPresentationAdditionalInfoSection";
import {
  NewCredential,
  newCredentials
} from "../../../../common/utils/itwCredentialUtils";

describe("ItwPresentationAdditionalInfoSection", () => {
  test.each(newCredentials)(
    "renders new credential alert for %s",
    (credentialType: NewCredential) => {
      const { queryByTestId } = renderComponent(credentialType);
      expect(queryByTestId("newCredentialAlertTestID")).not.toBeNull();
    }
  );

  it("does not render alert for non-new credentials", () => {
    const { queryByTestId } = renderComponent(CredentialType.DRIVING_LICENSE);
    expect(queryByTestId("newCredentialAlertTestID")).toBeNull();
  });
});

const renderComponent = (credentialType: CredentialType) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  return renderScreenWithNavigationStoreContext<GlobalState>(
    () => (
      <ItwPresentationAdditionalInfoSection
        credential={{
          ...ItwStoredCredentialsMocks.dc,
          credentialType
        }}
      />
    ),
    ITW_ROUTES.PRESENTATION.CREDENTIAL_DETAIL,
    {},
    createStore(appReducer, globalState as any)
  );
};
