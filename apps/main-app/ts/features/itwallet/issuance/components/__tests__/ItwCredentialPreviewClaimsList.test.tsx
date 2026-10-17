import { createStore } from "redux";

import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import {
  ITW_ISSUER_AUTHORITY_CLAIM_MOCK_LABEL,
  ItwStoredCredentialsMocks,
  withIssuerAuthorityClaimMock
} from "../../../common/utils/itwMocksUtils";
import { CredentialMetadata } from "../../../common/utils/itwTypesUtils";
import { ITW_ROUTES } from "../../../navigation/routes";
import { ItwCredentialPreviewClaimsList } from "../ItwCredentialPreviewClaimsList";

describe("ItwCredentialPreviewClaimsList", () => {
  it("should match the snapshot", () => {
    const component = renderComponent();
    expect(component).toMatchSnapshot();
  });

  test.each([
    {
      name: "hides the issuer_authority claim when the releaser is visible",
      releaserVisible: true,
      issuerAuthorityVisible: false
    },
    {
      name: "keeps the issuer_authority claim when the releaser is hidden",
      releaserVisible: false,
      issuerAuthorityVisible: true
    }
  ])("$name", ({ releaserVisible, issuerAuthorityVisible }) => {
    const { queryByText } = renderComponent(
      withIssuerAuthorityClaimMock(ItwStoredCredentialsMocks.ts),
      releaserVisible
    );

    expect(queryByText(ITW_ISSUER_AUTHORITY_CLAIM_MOCK_LABEL) !== null).toBe(
      issuerAuthorityVisible
    );
  });
});

function renderComponent(
  data: CredentialMetadata = ItwStoredCredentialsMocks.ts,
  releaserVisible?: boolean
) {
  const globalState = appReducer(undefined, applicationChangeState("active"));

  return renderScreenWithNavigationStoreContext<GlobalState>(
    () => (
      <ItwCredentialPreviewClaimsList
        data={data}
        releaserVisible={releaserVisible}
      />
    ),
    ITW_ROUTES.ISSUANCE.CREDENTIAL_PREVIEW,
    {},
    createStore(appReducer, globalState as any)
  );
}
