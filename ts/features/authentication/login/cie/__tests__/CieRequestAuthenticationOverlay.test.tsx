import React from "react";
import * as O from "fp-ts/lib/Option";
import * as E from "fp-ts/lib/Either";
import { createStore } from "redux";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { appReducer } from "../../../../../store/reducers";
import { applicationChangeState } from "../../../../../store/actions/application";
import { CieRequestAuthenticationOverlay } from "../components/CieRequestAuthenticationOverlay";
import * as MPSelectors from "../../../../../store/reducers/persistedPreferences";
import { lollipopKeyTagSelector } from "../../../../../features/lollipop/store/reducers/lollipop";
import { isFastLoginEnabledSelector } from "../../../fastLogin/store/selectors";
import { isCieLoginUatEnabledSelector } from "../store/selectors";
import { selectedIdentityProviderSelector } from "../../../../../features/authentication/common/store/selectors";
import * as LollipopLoginUtils from "../../../../../features/lollipop/utils/login";
import { useIOSelector } from "../../../../../store/hooks";

jest.mock("@react-native-cookies/cookies", () => ({
  removeSessionCookies: jest.fn(() => Promise.resolve(true))
}));

jest.mock("@react-native-community/netinfo", () => ({
  fetch: () => Promise.resolve({ isConnected: true })
}));

jest.mock("@pagopa/io-react-native-login-utils", () => ({
  LoginUtilsError: jest.fn()
}));

jest.mock("../../../../../components/helpers/withLoadingSpinner", () => ({
  withLoadingSpinner: (Component: any) => (props: any) =>
    <Component {...props} />
}));

jest.mock("../../../../../features/lollipop/utils/login", () => ({
  regenerateKeyGetRedirectsAndVerifySaml: jest.fn()
}));

jest.mock("../../../../../store/hooks", () => ({
  useIOSelector: jest.fn(),
  useIODispatch: () => jest.fn(),
  useIOStore: jest.fn()
}));

(useIOSelector as jest.Mock).mockReturnValue((selector: any) => {
  if (selector === lollipopKeyTagSelector) {
    return O.some("mock-key-tag");
  }
  if (selector === MPSelectors.isMixpanelEnabled) {
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
  .mockImplementation(() => Promise.resolve(E.right("https://mock-url.com")));

describe("CieRequestAuthenticationOverlay", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("Should match the snapshot", () => {
    const component = renderComponent();
    expect(component).toMatchSnapshot();
  });
});

const renderComponent = (
  propsOverride?: Partial<
    React.ComponentProps<typeof CieRequestAuthenticationOverlay>
  >
) => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, initialState as any);
  const defaultProps = {
    onClose: jest.fn(),
    onSuccess: jest.fn()
  };

  const props = {
    ...defaultProps,
    ...propsOverride
  };

  return renderScreenWithNavigationStoreContext(
    () => <CieRequestAuthenticationOverlay {...props} />,
    "DUMMY",
    {},
    store
  );
};
