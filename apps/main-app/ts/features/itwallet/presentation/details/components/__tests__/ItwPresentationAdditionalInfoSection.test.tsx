import { fireEvent } from "@testing-library/react-native";
import { createStore } from "redux";

import { applicationChangeState } from "../../../../../../store/actions/application";
import { appReducer } from "../../../../../../store/reducers";
import { GlobalState } from "../../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../../utils/testWrapper";
import { openWebUrl } from "../../../../../../utils/url";
import {
  NewCredential,
  newCredentials
} from "../../../../common/utils/itwCredentialUtils";
import {
  CredentialType,
  ItwStoredCredentialsMocks
} from "../../../../common/utils/itwMocksUtils";
import { ITW_ROUTES } from "../../../../navigation/routes";
import { ItwPresentationAdditionalInfoSection } from "../ItwPresentationAdditionalInfoSection";

jest.mock("../../../../../../utils/url", () => ({
  openWebUrl: jest.fn()
}));

describe("ItwPresentationAdditionalInfoSection", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test.each(newCredentials)(
    "renders new credential alert for %s",
    (credentialType: NewCredential) => {
      const { queryByTestId } = renderComponent(credentialType);
      expect(queryByTestId("newCredentialAlertTestID")).not.toBeNull();
    }
  );

  it("renders the usage banner for age verification", () => {
    const { queryByTestId, getByText } = renderComponent(
      CredentialType.AGE_VERIFICATION
    );

    expect(queryByTestId("ageVerificationUsageBannerTestID")).not.toBeNull();
    expect(getByText("Dove usare Età certificata?")).toBeTruthy();
    expect(getByText("Scopri di più")).toBeTruthy();
    expect(queryByTestId("newCredentialAlertTestID")).toBeNull();
  });

  it("opens the Help Center article when tapping the age verification banner CTA", () => {
    const { getByText } = renderComponent(CredentialType.AGE_VERIFICATION);

    fireEvent.press(getByText("Scopri di più"));

    expect(openWebUrl).toHaveBeenCalledWith(
      "https://assistenza.ioapp.it/hc/it",
      expect.any(Function)
    );
  });

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
