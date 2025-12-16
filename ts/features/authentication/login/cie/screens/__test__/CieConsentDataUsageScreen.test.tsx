// CieConsentDataUsageScreen.test.tsx

import { createStore } from "redux";
import { applicationChangeState } from "../../../../../../store/actions/application";
import { appReducer } from "../../../../../../store/reducers";
import { renderScreenWithNavigationStoreContext } from "../../../../../../utils/testWrapper";
import { runConsentScreenSuite } from "../../../../activeSessionLogin/shared/CieContentDataUsageCommonSuite";
import { AUTHENTICATION_ROUTES } from "../../../../common/navigation/routes";
import CieConsentDataUsageScreen from "../CieConsentDataUsageScreen";
import * as loginUtils from "../../../../common/utils/login";

jest.mock("react-native-webview", () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { View } = require("react-native");
  const WebView = (props: any) => <View {...props} />;
  return { __esModule: true, default: WebView };
});

jest.mock("../../../../../onboarding/hooks/useOnboardingAbortAlert", () => ({
  useOnboardingAbortAlert: () => ({ showAlert: jest.fn() })
}));
jest.mock("../../../../../../hooks/useHeaderSecondLevel", () => ({
  useHeaderSecondLevel: jest.fn()
}));
jest.mock("../../../../../../store/hooks", () => ({
  ...jest.requireActual("../../../../../../store/hooks"),
  useIOSelector: jest.fn(),
  useIODispatch: () => jest.fn(),
  useIOStore: jest.fn()
}));

// mock navigazione
const mockNavigation = { navigate: jest.fn(), replace: jest.fn() };
jest.mock("../../../../../../navigation/params/AppParamsList", () => ({
  useIONavigation: () => mockNavigation
}));

// spy onLoginUriChanged (path relativo corretto per QUESTA screen)
const onLoginUriChangedSpy = jest
  .spyOn(loginUtils, "onLoginUriChanged")
  .mockReturnValue(() => false);

const renderStd = () => {
  const initial = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, initial as any);
  return renderScreenWithNavigationStoreContext(
    () => <CieConsentDataUsageScreen />,
    AUTHENTICATION_ROUTES.CIE_CONSENT_DATA_USAGE,
    { cieConsentUri: encodeURIComponent("https://fake.url/consent") },
    store
  );
};

runConsentScreenSuite({
  name: "standard",
  render: renderStd,
  mockNavigation,
  onLoginUriChangedSpy,
  expectErrorRedirectMethod: "navigate",
  makeHttpError: () =>
    ({
      nativeEvent: {
        description: "500",
        statusCode: 500,
        url: "https://fake.url/consent"
      }
    } as any)
});
