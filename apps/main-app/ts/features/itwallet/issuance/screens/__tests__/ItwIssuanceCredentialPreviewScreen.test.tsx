import I18n from "i18next";
import { createStore } from "redux";
import { createActor } from "xstate";

import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { ItwStoredCredentialsMocks } from "../../../common/utils/itwMocksUtils";
import { Context } from "../../../machine/credential/context";
import { itwCredentialIssuanceMachine } from "../../../machine/credential/machine";
import { ItwCredentialIssuanceMachineContext } from "../../../machine/credential/provider";
import { ITW_ROUTES } from "../../../navigation/routes";
import { ItwIssuanceCredentialPreviewScreen } from "../ItwIssuanceCredentialPreviewScreen";

jest.mock("../../../../../utils/hooks/usePreventScreenCapture", () => ({
  usePreventScreenCapture: jest.fn()
}));

describe("ItwIssuanceCredentialPreviewScreen", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  it("should render the loading screen when no credential is available", () => {
    const { getByText } = renderComponent();

    expect(
      getByText(I18n.t("features.itWallet.issuance.credentialPreview.loading"))
    ).toBeTruthy();
  });

  it("should render title, subtitle and actions when the credential is available", () => {
    const { getByText } = renderComponent({
      credentials: [{ credential: "", metadata: ItwStoredCredentialsMocks.ts }]
    });

    expect(
      getByText(I18n.t("features.itWallet.issuance.credentialPreview.title"))
    ).toBeTruthy();
    expect(
      getByText(I18n.t("features.itWallet.issuance.credentialPreview.subtitle"))
    ).toBeTruthy();
    expect(
      getByText(
        I18n.t("features.itWallet.issuance.credentialPreview.actions.primary")
      )
    ).toBeTruthy();
    expect(
      getByText(
        I18n.t(
          "features.itWallet.issuance.credentialPreview.actions.somethingWrong"
        )
      )
    ).toBeTruthy();
  });
});

const renderComponent = (contextOverrides: Partial<Context> = {}) => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const initialSnapshot = createActor(
    itwCredentialIssuanceMachine
  ).getSnapshot();
  const snapshot: typeof initialSnapshot = {
    ...initialSnapshot,
    context: {
      ...initialSnapshot.context,
      ...contextOverrides
    }
  };

  return renderScreenWithNavigationStoreContext<GlobalState>(
    () => (
      <ItwCredentialIssuanceMachineContext.Provider options={{ snapshot }}>
        <ItwIssuanceCredentialPreviewScreen />
      </ItwCredentialIssuanceMachineContext.Provider>
    ),
    ITW_ROUTES.ISSUANCE.CREDENTIAL_PREVIEW,
    {},
    createStore(appReducer, initialState as any)
  );
};
