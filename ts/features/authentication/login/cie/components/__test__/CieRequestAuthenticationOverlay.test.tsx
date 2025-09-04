import React from "react";
import * as O from "fp-ts/lib/Option";
import * as E from "fp-ts/lib/Either";
import { fireEvent } from "@testing-library/react-native";
import { createStore } from "redux";
import I18n from "i18next";
import { appReducer } from "../../../../../../store/reducers";
import { applicationChangeState } from "../../../../../../store/actions/application";
import { CieRequestAuthenticationOverlay } from "../CieRequestAuthenticationOverlay";
import { renderScreenWithNavigationStoreContext } from "../../../../../../utils/testWrapper";
import { lollipopKeyTagSelector } from "../../../../../lollipop/store/reducers/lollipop";
import { isMixpanelEnabled } from "../../../../../../store/reducers/persistedPreferences";
import { isFastLoginEnabledSelector } from "../../../../fastLogin/store/selectors";
import { isCieLoginUatEnabledSelector } from "../../store/selectors";
import { selectedIdentityProviderSelector } from "../../../../common/store/selectors";
import * as LollipopLoginUtils from "../../../../../lollipop/utils/login";
import { useIOSelector } from "../../../../../../store/hooks";
import * as AnalyticsUtils from "../../../../../../utils/analytics";

jest
  .spyOn(AnalyticsUtils, "trackSpidLoginError")
  .mockImplementation(() => null);

jest.mock("@react-native-cookies/cookies", () => ({
  removeSessionCookies: jest.fn(() => Promise.resolve(true))
}));

jest.mock("@pagopa/io-react-native-login-utils", () => ({
  LoginUtilsError: jest.fn().mockImplementation(() => ({
    userInfo: { statusCode: "500" }
  })),
  isLoginUtilsError: jest.fn().mockReturnValue(false)
}));

jest.mock("../../../../../../components/helpers/withLoadingSpinner", () => ({
  withLoadingSpinner: (Component: any) => (props: any) =>
    <Component {...props} />
}));

jest.mock("../../../../../../features/lollipop/utils/login", () => ({
  regenerateKeyGetRedirectsAndVerifySaml: jest.fn()
}));

jest.mock("../../../../../../store/hooks", () => ({
  useIOSelector: jest.fn(),
  useIODispatch: () => jest.fn(),
  useIOStore: jest.fn()
}));

(useIOSelector as jest.Mock).mockImplementation((selector: any) => {
  if (selector === lollipopKeyTagSelector) {
    return O.some("mock-key-tag");
  }
  if (selector === isMixpanelEnabled) {
    return false;
  }
  if (selector === isFastLoginEnabledSelector) {
    return false;
  }
  if (selector === isCieLoginUatEnabledSelector) {
    return false;
  }
  if (selector === selectedIdentityProviderSelector) {
    return {
      id: "cie-id",
      name: "",
      logo: "",
      profileUrl: ""
    };
  }
  return undefined;
});

jest
  .spyOn(LollipopLoginUtils, "regenerateKeyGetRedirectsAndVerifySaml")
  .mockReturnValue(Promise.resolve(E.right("https://mock-url.com")));

describe("CieRequestAuthenticationOverlay", () => {
  const onCloseMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render correctly and match snapshot", () => {
    const component = renderComponent();
    expect(component).toMatchSnapshot();
  });

  it("should call onClose when pressing cancel", async () => {
    const { getByText, findByTestId } = renderComponent({
      onClose: onCloseMock
    });
    const webview = await findByTestId("webview");

    fireEvent(webview, "onError", {
      nativeEvent: { description: "error" }
    });

    expect(getByText(I18n.t("global.buttons.cancel"))).toBeTruthy();
    expect(getByText(I18n.t("global.buttons.retry"))).toBeTruthy();
  });

  it("should reload on retry", async () => {
    const { getByText, findByTestId } = renderComponent({
      onClose: onCloseMock
    });

    const webview = await findByTestId("webview");

    fireEvent(webview, "onError", {
      nativeEvent: { description: "error" }
    });

    fireEvent.press(getByText(I18n.t("global.buttons.retry")));

    expect(webview).toBeTruthy();
  });

  it("should call handleOnError when WebView emits error", async () => {
    const { findByTestId, findByText } = renderComponent();

    const webview = await findByTestId("webview");

    const errorValue = {
      nativeEvent: { description: "error" }
    };

    fireEvent(webview, "onError", errorValue);

    expect(await findByText(I18n.t("global.buttons.retry"))).toBeTruthy();
    expect(AnalyticsUtils.trackSpidLoginError).toHaveBeenCalledWith(
      "cie",
      errorValue
    );
  });
});

const renderComponent = (
  propsOverride?: Partial<
    React.ComponentProps<typeof CieRequestAuthenticationOverlay>
  >
) => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, initialState as any);
  const props = {
    onClose: jest.fn(),
    onSuccess: jest.fn(),
    ...propsOverride
  };

  return renderScreenWithNavigationStoreContext(
    () => <CieRequestAuthenticationOverlay {...props} />,
    "DUMMY",
    {},
    store
  );
};
