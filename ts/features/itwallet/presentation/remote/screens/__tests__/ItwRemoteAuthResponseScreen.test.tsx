import { createActor } from "xstate";
import { createStore } from "redux";
import I18n from "i18next";
import { itwRemoteMachine } from "../../machine/machine";
import { renderScreenWithNavigationStoreContext } from "../../../../../../utils/testWrapper";
import { appReducer } from "../../../../../../store/reducers";
import { ItwRemoteMachineContext } from "../../machine/provider";
import { ItwRemoteAuthResponseScreen } from "../ItwRemoteAuthResponseScreen";
import { ITW_REMOTE_ROUTES } from "../../navigation/routes";
import { applicationChangeState } from "../../../../../../store/actions/application";
import { ItwRemoteFlowType } from "../../utils/itwRemoteTypeUtils";

describe("ItwRemoteAuthResponseScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should match snapshot when no redirect_uri is available", () => {
    expect(renderComponent("same-device")).toMatchSnapshot();
  });

  it("should match snapshot when a redirect_uri is available in same-device flow", () => {
    expect(
      renderComponent("same-device", "https://myrp/auth/success")
    ).toMatchSnapshot();
  });

  it("should show the redirect CTA when flow type is same-device and redirect_uri is available", () => {
    const { getByText, queryByText } = renderComponent(
      "same-device",
      "https://myrp/auth/success"
    );

    expect(
      getByText(I18n.t("features.itWallet.presentation.remote.success.cta"))
    ).toBeTruthy();
    expect(queryByText(I18n.t("global.buttons.close"))).toBeNull();
  });

  it("should show close CTA when flow type is cross-device", () => {
    const { getByText, queryByText } = renderComponent(
      "cross-device",
      "https://myrp/auth/success"
    );

    expect(getByText(I18n.t("global.buttons.close"))).toBeTruthy();
    expect(
      queryByText(I18n.t("features.itWallet.presentation.remote.success.cta"))
    ).toBeNull();
  });

  it("should show close CTA when flow type is same-device and redirect_uri is unavailable", () => {
    const { getByText, queryByText } = renderComponent("same-device");

    expect(getByText(I18n.t("global.buttons.close"))).toBeTruthy();
    expect(
      queryByText(I18n.t("features.itWallet.presentation.remote.success.cta"))
    ).toBeNull();
  });
});

const renderComponent = (flowType: ItwRemoteFlowType, redirectUri?: string) => {
  const initialSnapshot = createActor(itwRemoteMachine).getSnapshot();
  const initialState = appReducer(undefined, applicationChangeState("active"));

  const hydratedSnapshot: typeof initialSnapshot = {
    ...initialSnapshot,
    value: "Success",
    context: {
      ...initialSnapshot.context,
      flowType,
      redirectUri
    }
  };
  const actor = createActor(itwRemoteMachine, {
    snapshot: hydratedSnapshot
  });
  actor.start();
  const snapshot = actor.getSnapshot();

  return renderScreenWithNavigationStoreContext(
    () => (
      <ItwRemoteMachineContext.Provider options={{ snapshot }}>
        <ItwRemoteAuthResponseScreen />
      </ItwRemoteMachineContext.Provider>
    ),
    ITW_REMOTE_ROUTES.AUTH_RESPONSE,
    {},
    createStore(appReducer, initialState as any)
  );
};
