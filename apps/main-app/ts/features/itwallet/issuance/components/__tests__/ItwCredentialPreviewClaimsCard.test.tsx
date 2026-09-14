import { createStore } from "redux";

import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { ItwStoredCredentialsMocks } from "../../../common/utils/itwMocksUtils";
import { ITW_ROUTES } from "../../../navigation/routes";
import { ItwCredentialPreviewClaimsCard } from "../ItwCredentialPreviewClaimsCard";

describe("ItwCredentialPreviewClaimsCard", () => {
  it("should match the snapshot", () => {
    const component = renderComponent();
    expect(component).toMatchSnapshot();
  });

  it("should render the credential name as card header", () => {
    const { getByText } = renderComponent();
    expect(getByText("Tessera Sanitaria")).toBeTruthy();
  });
});

function renderComponent() {
  const globalState = appReducer(undefined, applicationChangeState("active"));

  return renderScreenWithNavigationStoreContext<GlobalState>(
    () => (
      <ItwCredentialPreviewClaimsCard
        data={ItwStoredCredentialsMocks.ts}
        title="Tessera Sanitaria"
      />
    ),
    ITW_ROUTES.ISSUANCE.CREDENTIAL_PREVIEW,
    {},
    createStore(appReducer, globalState as any)
  );
}
