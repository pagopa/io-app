import { createStore } from "redux";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import {
  ItwCredentialFromCatalogueMocks,
  ItwStoredCredentialsMocks
} from "../../../common/utils/itwMocksUtils";
import { ITW_ROUTES } from "../../../navigation/routes";
import { ItwCredentialPreviewClaimsList } from "../ItwCredentialPreviewClaimsList";
import * as credentialCatalogueSelectors from "../../../credentialsCatalogue/store/selectors";

describe("ItwCredentialPreviewClaimsList", () => {
  it("should match the snapshot", () => {
    const component = renderComponent();
    expect(component).toMatchSnapshot();
  });
});

function renderComponent() {
  const globalState = appReducer(undefined, applicationChangeState("active"));

  jest
    .spyOn(credentialCatalogueSelectors, "itwCredentialByTypeSelector")
    .mockReturnValue(ItwCredentialFromCatalogueMocks);

  return renderScreenWithNavigationStoreContext<GlobalState>(
    () => (
      <ItwCredentialPreviewClaimsList data={ItwStoredCredentialsMocks.ts} />
    ),
    ITW_ROUTES.ISSUANCE.CREDENTIAL_PREVIEW,
    {},
    createStore(appReducer, globalState as any)
  );
}
