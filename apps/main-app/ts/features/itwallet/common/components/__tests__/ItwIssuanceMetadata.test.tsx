import configureMockStore from "redux-mock-store";
import I18n from "i18next";
import ROUTES from "../../../../../navigation/routes";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { CredentialMetadata } from "../../utils/itwTypesUtils";
import { ItwStoredCredentialsMocks } from "../../utils/itwMocksUtils";
import { ItwIssuanceMetadata } from "../ItwIssuanceMetadata";

describe("ItwIssuanceMetadata", () => {
  it("displays the hardcoded 'IT Wallet' data source for the proof_of_age credential", () => {
    const { queryByText } = renderComponent(
      ItwStoredCredentialsMocks.L3.proofOfAge
    );

    const authSourceLabel = I18n.t(
      "features.itWallet.verifiableCredentials.claims.authenticSource"
    );

    expect(queryByText(authSourceLabel)).not.toBeNull();
    expect(queryByText("IT-Wallet ID")).not.toBeNull();
  });
});

const renderComponent = (credential: CredentialMetadata) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));

  const mockStore = configureMockStore<GlobalState>();
  const store: ReturnType<typeof mockStore> = mockStore(globalState);

  return renderScreenWithNavigationStoreContext<GlobalState>(
    () => <ItwIssuanceMetadata credential={credential} />,
    ROUTES.WALLET_HOME,
    {},
    store
  );
};
