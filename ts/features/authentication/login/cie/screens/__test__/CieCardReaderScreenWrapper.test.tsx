import { createStore } from "redux";
import { Platform } from "react-native";
import { appReducer } from "../../../../../../store/reducers";
import { applicationChangeState } from "../../../../../../store/actions/application";
import { renderScreenWithNavigationStoreContext } from "../../../../../../utils/testWrapper";
import { AUTHENTICATION_ROUTES } from "../../../../common/navigation/routes";
import { CieCardReaderScreenWrapper } from "../CieCardReaderScreenWrapper";

jest
  .spyOn(Platform, "select")
  .mockImplementation((specifics: any) => specifics.default);

jest.mock("react-native/Libraries/EventEmitter/NativeEventEmitter");

jest.mock("@pagopa/react-native-cie", () => ({
  __esModule: true,
  default: {
    start: jest.fn().mockResolvedValue(undefined),
    startListeningNFC: jest.fn().mockResolvedValue(undefined),
    stopListeningNFC: jest.fn().mockResolvedValue(undefined),
    removeAllListeners: jest.fn(),
    onEvent: jest.fn(),
    onError: jest.fn(),
    onSuccess: jest.fn(),
    setPin: jest.fn().mockResolvedValue(undefined),
    setAuthenticationUrl: jest.fn(),
    enableLog: jest.fn(),
    setCustomIdpUrl: jest.fn()
  },
  Event: {}
}));

// Mock a React Navigation route
jest.mock("@react-navigation/native", () => {
  const actual = jest.requireActual("@react-navigation/native");
  return {
    ...actual,
    useNavigation: () => ({
      navigate: jest.fn(),
      reset: jest.fn(),
      goBack: jest.fn(),
      setOptions: jest.fn(),
      dispatch: jest.fn(),
      canGoBack: jest.fn(),
      getParent: jest.fn()
    }),
    useRoute: () => ({
      name: "CIE_CARD_READER_SCREEN",
      key: "CIE_CARD_READER_SCREEN_KEY",
      params: {
        ciePin: "123456",
        authorizationUri: "https://test.uri"
      }
    })
  };
});

describe("CieCardReaderScreenWrapper", () => {
  it("Should match the snapshot", () => {
    const { toJSON } = renderComponent();

    expect(toJSON()).toMatchSnapshot();
  });

  it("should render the wrapper and pass props to CieCardReaderScreen", () => {
    const { getByTestId } = renderComponent();

    expect(getByTestId("cie-card-reader-screen-test-id")).toBeTruthy();
  });
});

function renderComponent() {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, initialState as any);

  return renderScreenWithNavigationStoreContext(
    () => <CieCardReaderScreenWrapper />,
    AUTHENTICATION_ROUTES.CIE_CARD_READER_SCREEN,
    {},
    store
  );
}
