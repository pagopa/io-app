import { createStore } from "redux";

import { applicationChangeState } from "../../../../../../store/actions/application";
import { appReducer } from "../../../../../../store/reducers";
import { renderScreenWithNavigationStoreContext } from "../../../../../../utils/testWrapper";
import { AUTHENTICATION_ROUTES } from "../../../../common/navigation/routes";
import * as OneIdentityCieAuthenticationWebViewModule from "../../components/OneIdentityCieAuthenticationWebView";
import * as OneIdentityCieAuthorizationWebViewModule from "../../components/OneIdentityCieAuthorizationWebView";
import * as OneIdentityCieCardReaderModule from "../../components/OneIdentityCieCardReader";
import { OneIdentityCieAuthScreen } from "../OneIdentityCieAuthScreen";

jest.mock("../../components/OneIdentityCieAuthenticationWebView", () => ({
  OneIdentityCieAuthenticationWebView: jest.fn(() => null)
}));
jest.mock("../../components/OneIdentityCieCardReader", () => ({
  OneIdentityCieCardReader: jest.fn(() => null)
}));
jest.mock("../../components/OneIdentityCieAuthorizationWebView", () => ({
  OneIdentityCieAuthorizationWebView: jest.fn(() => null)
}));

const mockOneIdentityCieAuthenticationWebView = jest.mocked(
  OneIdentityCieAuthenticationWebViewModule.OneIdentityCieAuthenticationWebView
);
const mockOneIdentityCieCardReader = jest.mocked(
  OneIdentityCieCardReaderModule.OneIdentityCieCardReader
);
const mockOneIdentityCieAuthorizationWebView = jest.mocked(
  OneIdentityCieAuthorizationWebViewModule.OneIdentityCieAuthorizationWebView
);

const PIN = "12345678";

const renderComponent = () => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, initialState as any);

  return renderScreenWithNavigationStoreContext(
    OneIdentityCieAuthScreen,
    AUTHENTICATION_ROUTES.CIE_AUTH_SCREEN,
    { pin: PIN },
    store
  );
};

describe("OneIdentityCieAuthScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render only the authentication WebView as the first step", () => {
    renderComponent();

    expect(mockOneIdentityCieAuthenticationWebView).toHaveBeenCalledTimes(1);
    expect(mockOneIdentityCieCardReader).not.toHaveBeenCalled();
    expect(mockOneIdentityCieAuthorizationWebView).not.toHaveBeenCalled();
  });

  it("should render the CIE card reader with the authentication URL and pin once received", () => {
    mockOneIdentityCieAuthenticationWebView.mockImplementation(
      ({ onAuthenticationUrlReceived }) => {
        onAuthenticationUrlReceived("https://example.com/auth");
        return <></>;
      }
    );

    renderComponent();

    expect(mockOneIdentityCieCardReader).toHaveBeenCalledWith(
      expect.objectContaining({
        authenticationUrl: "https://example.com/auth",
        pin: PIN
      }),
      undefined
    );
    expect(mockOneIdentityCieAuthorizationWebView).not.toHaveBeenCalled();
  });

  it("should render the authorization WebView with the authorization URL once received", () => {
    mockOneIdentityCieAuthenticationWebView.mockImplementation(
      ({ onAuthenticationUrlReceived }) => {
        onAuthenticationUrlReceived("https://example.com/auth");
        return <></>;
      }
    );
    mockOneIdentityCieCardReader.mockImplementation(
      ({ onAuthorizationUrlReceived }) => {
        onAuthorizationUrlReceived("https://example.com/authz");
        return <></>;
      }
    );

    renderComponent();

    expect(mockOneIdentityCieAuthorizationWebView).toHaveBeenCalledWith(
      {
        authorizationUrl: "https://example.com/authz"
      },
      undefined
    );
  });
});
