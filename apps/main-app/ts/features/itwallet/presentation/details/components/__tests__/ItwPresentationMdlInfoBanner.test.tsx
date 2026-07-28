import { fireEvent } from "@testing-library/react-native";
import I18n from "i18next";
import configureMockStore from "redux-mock-store";

import { applicationChangeState } from "../../../../../../store/actions/application";
import { appReducer } from "../../../../../../store/reducers";
import { GlobalState } from "../../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../../utils/testWrapper";
import { itwCloseBanner } from "../../../../common/store/actions/banners";
import { CredentialMetadata } from "../../../../common/utils/itwTypesUtils";
import * as credentialSelectors from "../../../../credentials/store/selectors";
import { ITW_ROUTES } from "../../../../navigation/routes";
import { ItwPresentationMdlInfoBanner } from "../ItwPresentationMdlInfoBanner";

const mockedMdl: CredentialMetadata = {
  credentialType: "mDL",
  credentialId: "dc_sd_jwt_mDL",
  parsedCredential: {},
  format: "dc+sd-jwt",
  keyTag: "1",
  issuerConf: {} as CredentialMetadata["issuerConf"],
  jwt: {
    issuedAt: "2024-09-30T07:32:49.000Z",
    expiration: "2100-09-04T00:00:00.000Z"
  },
  spec_version: "1.0.0"
};

const mockStatusSelector = (
  status: ReturnType<typeof credentialSelectors.itwCredentialStatusSelector>
) =>
  jest
    .spyOn(credentialSelectors, "itwCredentialStatusSelector")
    .mockImplementation(() => status);

describe("ItwPresentationMdlInfoBanner", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("renders the informational content when the credential is valid", () => {
    mockStatusSelector({ status: "valid", message: undefined });

    const { getByText, getByTestId } = renderComponent();

    expect(getByTestId("itwMdlBannerTestID")).not.toBeNull();
    expect(
      getByText(I18n.t("features.itWallet.presentation.alerts.mdl.bannerTitle"))
    ).not.toBeNull();
    expect(
      getByText(I18n.t("features.itWallet.presentation.alerts.mdl.content"))
    ).not.toBeNull();
  });

  it("renders nothing when the credential status is not valid", () => {
    mockStatusSelector({ status: "expired", message: undefined });

    const { queryByTestId } = renderComponent();

    expect(queryByTestId("itwMdlBannerTestID")).toBeNull();
  });

  it("dispatches the close action when dismissed", () => {
    mockStatusSelector({ status: "valid", message: undefined });

    const { getByLabelText, store } = renderComponent();

    fireEvent.press(getByLabelText(I18n.t("global.buttons.close")));

    expect(store.getActions()).toContainEqual(itwCloseBanner("mdlDetailsInfo"));
  });
});

function renderComponent() {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const mockStore = configureMockStore<GlobalState>();
  const store: ReturnType<typeof mockStore> = mockStore(globalState);

  return {
    ...renderScreenWithNavigationStoreContext<GlobalState>(
      () => <ItwPresentationMdlInfoBanner credential={mockedMdl} />,
      ITW_ROUTES.PRESENTATION.CREDENTIAL_DETAIL,
      {},
      store
    ),
    store
  };
}
