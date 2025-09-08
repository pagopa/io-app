import { fireEvent, render } from "@testing-library/react-native";
import { Provider } from "react-redux";
import configureMockStore, { MockStoreEnhanced } from "redux-mock-store";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import _ from "lodash";
import { IdentificationModal } from "../IdentificationModal";
import { appReducer } from "../../../../store/reducers";
import { applicationChangeState } from "../../../../store/actions/application";
import { GlobalState } from "../../../../store/reducers/types";

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: jest.fn()
}));

jest.mock("react-native-background-timer", () => ({
  runBackgroundTimer: jest.fn(),
  stopBackgroundTimer: jest.fn()
}));

jest.mock("react-native", () => {
  const actualReactNative = jest.requireActual("react-native");
  return {
    ...actualReactNative,
    Alert: {
      alert: jest.fn()
    }
  };
});

const globalState = appReducer(undefined, applicationChangeState("active"));
const mockStore = configureMockStore<GlobalState>();

describe("IdentificationModal", () => {
  beforeEach(() => {
    (useSafeAreaInsets as jest.Mock).mockReturnValue({ top: 10, bottom: 10 });
  });

  const store: ReturnType<typeof mockStore> = mockStore(
    _.merge(undefined, globalState, {
      identification: {
        progress: { kind: "started", pin: "123456", isValidatingTask: false },
        fail: undefined
      }
    } as GlobalState)
  );

  it("should render the modal when identification is started", () => {
    const { getByText, getByTestId } = renderComponent(store);

    expect(getByTestId("identification-modal")).toBeTruthy();
    expect(getByText("Ciao!")).toBeTruthy();
  });

  it("should not render the modal when identification is not started", () => {
    const newStore: ReturnType<typeof mockStore> = mockStore(
      _.merge(undefined, globalState, {
        identification: {
          progress: { kind: "unidentified" }
        }
      } as GlobalState)
    );

    const { queryByText, queryByTestId } = renderComponent(newStore);

    expect(queryByTestId("identification-modal")).toBeNull();
    expect(queryByText("Ciao!")).toBeNull();
  });

  // test IdentificationLockModal
  it("should render the lock modal when identification is locked", () => {
    const newStore: ReturnType<typeof mockStore> = mockStore(
      _.merge(undefined, globalState, {
        identification: {
          progress: { kind: "started" },
          fail: {
            remainingAttempts: 4,
            nextLegalAttempt: new Date(Date.now() + 1000 * 60 * 60),
            timespanBetweenAttempts: 3600,
            showLockModal: true
          }
        }
      } as GlobalState)
    );

    const { getByTestId } = renderComponent(newStore);

    expect(getByTestId("identification-lock-modal")).toBeTruthy();
  });

  it("should display remaining attempts alert", () => {
    const newStore: ReturnType<typeof mockStore> = mockStore(
      _.merge(undefined, globalState, {
        identification: {
          progress: { kind: "started" },
          fail: {
            remainingAttempts: 2,
            nextLegalAttempt: new Date(Date.now() + 1000 * 60),
            timespanBetweenAttempts: 60,
            showLockModal: false
          }
        }
      } as GlobalState)
    );

    const { getByText } = renderComponent(newStore);

    expect(getByText(/Hai a disposizione ancora 2 tentativi/i)).toBeTruthy();
  });

  it("should show forgot code button", () => {
    const newStore: ReturnType<typeof mockStore> = mockStore(
      _.merge(undefined, globalState, {
        identification: {
          progress: { kind: "started", pin: "123456", isValidatingTask: false },
          fail: undefined
        }
      } as GlobalState)
    );

    const { getByText } = renderComponent(newStore);

    const forgotCodeButton = getByText(/Hai dimenticato il/i);
    expect(forgotCodeButton).toBeTruthy();
  });

  it("should show close button during validating task", () => {
    const newStore: ReturnType<typeof mockStore> = mockStore(
      _.merge(undefined, globalState, {
        identification: {
          progress: { kind: "started", pin: "123456", isValidatingTask: true },
          fail: undefined
        }
      } as GlobalState)
    );

    const { getByLabelText } = renderComponent(newStore);

    const closeButton = getByLabelText(/Chiudi/i);
    expect(closeButton).toBeTruthy();
  });

  it("should show close button with specific label and fire onCancel if passed", () => {
    const mockOnCancel = jest.fn();
    const newStore: ReturnType<typeof mockStore> = mockStore(
      _.merge(undefined, globalState, {
        identification: {
          progress: {
            kind: "started",
            pin: "123456",
            isValidatingTask: true,
            identificationCancelData: {
              label: "Cancel operation",
              onCancel: mockOnCancel as () => void
            }
          },
          fail: undefined
        }
      } as GlobalState)
    );

    const { getByLabelText } = renderComponent(newStore);

    const closeButton = getByLabelText(/Cancel operation/i);
    expect(closeButton).toBeTruthy();
    fireEvent.press(closeButton);
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });
});

const renderComponent = (providerStore: MockStoreEnhanced) =>
  render(
    <Provider store={providerStore}>
      <IdentificationModal />
    </Provider>
  );
