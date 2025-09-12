// ActiveSessionLoginCieConsentDataUsageScreen.test.tsx

import { createStore } from "redux";
import { applicationChangeState } from "../../../../store/actions/application";
import { appReducer } from "../../../../store/reducers";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import { AUTHENTICATION_ROUTES } from "../../common/navigation/routes";
import ActiveSessionLoginCieConsentDataUsageScreen from "../screens/cie/ActiveSessionLoginCieConsentDataUsageScreen";
import * as loginUtils from "../../common/utils/login";
import { runConsentScreenSuite } from "../shared/CieContentDataUsageCommonSuite";

jest.mock("react-native-webview", () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { View } = require("react-native");
  const WebView = (props: any) => <View {...props} />;
  return { __esModule: true, default: WebView };
});
jest.mock("../../../onboarding/hooks/useOnboardingAbortAlert", () => ({
  useOnboardingAbortAlert: () => ({ showAlert: jest.fn() })
}));
jest.mock("../../../../hooks/useHeaderSecondLevel", () => ({
  useHeaderSecondLevel: jest.fn()
}));
jest.mock("../../../../store/hooks", () => ({
  ...jest.requireActual("../../../../store/hooks"),
  useIOSelector: jest.fn(),
  useIODispatch: () => jest.fn(),
  useIOStore: jest.fn()
}));

const mockNavigation = { navigate: jest.fn(), replace: jest.fn() };
jest.mock("../../../../navigation/params/AppParamsList", () => ({
  useIONavigation: () => mockNavigation
}));

const onLoginUriChangedSpy = jest
  .spyOn(loginUtils, "onLoginUriChanged")
  .mockReturnValue(() => false);

const renderActive = () => {
  const initial = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, initial as any);
  return renderScreenWithNavigationStoreContext(
    () => <ActiveSessionLoginCieConsentDataUsageScreen />,
    AUTHENTICATION_ROUTES.CIE_CONSENT_DATA_USAGE_ACTIVE_SESSION_LOGIN,
    { cieConsentUri: encodeURIComponent("https://fake.url/consent") },
    store
  );
};

runConsentScreenSuite({
  name: "active-session",
  render: renderActive,
  mockNavigation,
  onLoginUriChangedSpy,
  expectErrorRedirectMethod: "replace",
  makeHttpError: () =>
    ({
      nativeEvent: {
        description: "500",
        statusCode: 500,
        url: "https://fake.url/consent"
      }
    } as any)
});
