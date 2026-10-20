import { fireEvent } from "@testing-library/react-native";
import I18n from "i18next";
import { createStore } from "redux";

import { applicationChangeState } from "../../../../../../store/actions/application.ts";
import { appReducer } from "../../../../../../store/reducers";
import { GlobalState } from "../../../../../../store/reducers/types.ts";
import { renderScreenWithNavigationStoreContext } from "../../../../../../utils/testWrapper.tsx";
import { ItwStoredCredentialsMocks } from "../../../../common/utils/itwMocksUtils.ts";
import { CredentialMetadata } from "../../../../common/utils/itwTypesUtils.ts";
import { ITW_ROUTES } from "../../../../navigation/routes.ts";
import { ItwPresentationClaimsSection } from "../ItwPresentationClaimsSection.tsx";

describe("ItwPresentationClaimsSection", () => {
  it("should match the snapshot when claims are visible", () => {
    const component = renderComponent();
    expect(component).toMatchSnapshot();
  });

  it("should match the snapshot when claims are hidden", () => {
    const component = renderComponent();
    const toggleButton = component.queryByTestId("toggle-claim-visibility");

    if (!toggleButton) {
      throw new Error("Toggle button not found");
    }

    fireEvent(toggleButton, "onPress");
    expect(component).toMatchSnapshot();
  });

  it("should expose a single control to toggle claim visibility", () => {
    const component = renderComponent();

    expect(
      component.getAllByLabelText(
        I18n.t(
          "features.itWallet.presentation.credentialDetails.actions.hideClaimValues"
        )
      )
    ).toHaveLength(1);
  });

  it("should not render the European Disability Card QR code in the claims list", () => {
    const component = renderComponent(ItwStoredCredentialsMocks.dc);

    expect(component.queryByLabelText("QR Code")).toBeNull();
  });

  it("should expose the European Disability Card validity status to screen readers", () => {
    const component = renderComponent(ItwStoredCredentialsMocks.dc);

    expect(
      component.getByLabelText("Scadenza; 23/03/2032; Valida")
    ).toBeTruthy();
  });
});

function renderComponent(
  credential: CredentialMetadata = ItwStoredCredentialsMocks.ts
) {
  const globalState = appReducer(undefined, applicationChangeState("active"));

  return renderScreenWithNavigationStoreContext<GlobalState>(
    () => (
      <ItwPresentationClaimsSection
        credential={{
          ...credential,
          jwt: { expiration: "2100-01-01T00:00:00Z" }
        }}
      />
    ),
    ITW_ROUTES.PRESENTATION.CREDENTIAL_DETAIL,
    {},
    createStore(appReducer, globalState as any)
  );
}
