import { createStore } from "redux";
import { AccessibilityInfo } from "react-native";
import { GlobalState } from "../../../../../store/reducers/types";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { Toasts } from "../Toasts";
import { MESSAGES_ROUTES } from "../../../navigation/routes";
import * as archivingReducer from "../../../store/reducers/archiving";
import * as preferencesReducer from "../../../../../store/reducers/preferences";
import * as allPaginatedReducer from "../../../store/reducers/allPaginated";

const mockToastSuccess = jest.fn();
const mockToastError = jest.fn();
jest.mock("@pagopa/io-app-design-system", () => ({
  ...jest.requireActual("@pagopa/io-app-design-system"),
  useIOToast: () => ({
    show: (_message: string, _options?: unknown) => jest.fn(),
    error: mockToastError,
    warning: (_message: string) => jest.fn(),
    success: mockToastSuccess,
    info: (_message: string) => jest.fn(),
    hideAll: () => jest.fn(),
    hide: (_id: number) => jest.fn()
  })
}));

describe("Toast", () => {
  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it("should match empty snapshot", () => {
    const component = renderComponent();
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should display no toast when there are no data to show", () => {
    const mockedAnnounceForAccessibility = jest
      .spyOn(AccessibilityInfo, "announceForAccessibility")
      .mockImplementation(jest.fn());
    mockSelectorOutput();

    renderComponent();

    expect(mockToastSuccess.mock.calls.length).toBe(0);
    expect(mockToastError.mock.calls.length).toBe(0);
    expect(mockedAnnounceForAccessibility.mock.calls.length).toBe(0);
  });
  it("should display a success toast when a message has been successfully archived or restored. No accessibility announcement if screen reader is disabled", () => {
    const mockedAnnounceForAccessibility = jest
      .spyOn(AccessibilityInfo, "announceForAccessibility")
      .mockImplementation(jest.fn());
    const reason = "My reason of success";
    mockSelectorOutput("success", reason, false);

    renderComponent();

    expect(mockToastSuccess.mock.calls.length).toBe(1);
    expect(mockToastSuccess.mock.calls[0].length).toBe(1);
    expect(mockToastSuccess.mock.calls[0][0]).toBe(reason);

    expect(mockToastError.mock.calls.length).toBe(0);

    expect(mockedAnnounceForAccessibility.mock.calls.length).toBe(0);
  });
  it("should display a success toast when a message has been successfully archived or restored. Accessibility was announced with screen reader enabled", () => {
    const mockedAnnounceForAccessibility = jest
      .spyOn(AccessibilityInfo, "announceForAccessibility")
      .mockImplementation(jest.fn());
    const reason = "My reason of success";
    mockSelectorOutput("success", reason, true);

    renderComponent();

    expect(mockToastSuccess.mock.calls.length).toBe(1);
    expect(mockToastSuccess.mock.calls[0].length).toBe(1);
    expect(mockToastSuccess.mock.calls[0][0]).toBe(reason);

    expect(mockToastError.mock.calls.length).toBe(0);

    expect(mockedAnnounceForAccessibility.mock.calls.length).toBe(1);
    expect(mockedAnnounceForAccessibility.mock.calls[0].length).toBe(1);
    expect(mockedAnnounceForAccessibility.mock.calls[0][0]).toBe(reason);
  });
  it("should display a failure toast when a message has been successfully archived or restored. No accessibility announcement if screen reader is disabled", () => {
    const mockedAnnounceForAccessibility = jest
      .spyOn(AccessibilityInfo, "announceForAccessibility")
      .mockImplementation(jest.fn());
    const reason = "My reason of failure";
    mockSelectorOutput("error", reason, false);

    renderComponent();

    expect(mockToastError.mock.calls.length).toBe(1);
    expect(mockToastError.mock.calls[0].length).toBe(1);
    expect(mockToastError.mock.calls[0][0]).toBe(reason);

    expect(mockToastSuccess.mock.calls.length).toBe(0);

    expect(mockedAnnounceForAccessibility.mock.calls.length).toBe(0);
  });
  it("should display a failure toast when a message has been successfully archived or restored. Accessibility was announced with screen reader enabled", () => {
    const mockedAnnounceForAccessibility = jest
      .spyOn(AccessibilityInfo, "announceForAccessibility")
      .mockImplementation(jest.fn());
    const reason = "My reason of failure";
    mockSelectorOutput("error", reason, true);

    renderComponent();

    expect(mockToastError.mock.calls.length).toBe(1);
    expect(mockToastError.mock.calls[0].length).toBe(1);
    expect(mockToastError.mock.calls[0][0]).toBe(reason);

    expect(mockToastSuccess.mock.calls.length).toBe(0);

    expect(mockedAnnounceForAccessibility.mock.calls.length).toBe(1);
    expect(mockedAnnounceForAccessibility.mock.calls[0].length).toBe(1);
    expect(mockedAnnounceForAccessibility.mock.calls[0][0]).toBe(reason);
  });
  it("should display a failure toast when there is an error in the Inbox", () => {
    const mockedAnnounceForAccessibility = jest
      .spyOn(AccessibilityInfo, "announceForAccessibility")
      .mockImplementation(jest.fn());
    mockSelectorOutput(
      undefined,
      undefined,
      false,
      "Inbox error that is not displayed to the user"
    );

    renderComponent();

    expect(mockToastError.mock.calls.length).toBe(1);
    expect(mockToastError.mock.calls[0].length).toBe(1);
    expect(mockToastError.mock.calls[0][0]).toBe(
      "C'è un problema temporaneo, riprova."
    );

    expect(mockToastSuccess.mock.calls.length).toBe(0);

    expect(mockedAnnounceForAccessibility.mock.calls.length).toBe(0);
  });
  it("should display a failure toast when there is an error in the Archive", () => {
    const mockedAnnounceForAccessibility = jest
      .spyOn(AccessibilityInfo, "announceForAccessibility")
      .mockImplementation(jest.fn());
    mockSelectorOutput(
      undefined,
      undefined,
      false,
      undefined,
      "Archive error that is not displayed to the user"
    );

    renderComponent();

    expect(mockToastError.mock.calls.length).toBe(1);
    expect(mockToastError.mock.calls[0].length).toBe(1);
    expect(mockToastError.mock.calls[0][0]).toBe(
      "C'è un problema temporaneo, riprova."
    );

    expect(mockToastSuccess.mock.calls.length).toBe(0);

    expect(mockedAnnounceForAccessibility.mock.calls.length).toBe(0);
  });
  it("should display three toasts when there is a success in archiving/restoring, an error in Inbox and an error in Archive", () => {
    const mockedAnnounceForAccessibility = jest
      .spyOn(AccessibilityInfo, "announceForAccessibility")
      .mockImplementation(jest.fn());
    const successReason = "My reason of success";
    mockSelectorOutput(
      "success",
      successReason,
      false,
      "Inbox error that is not displayed to the user",
      "Archive error that is not displayed to the user"
    );

    renderComponent();

    expect(mockToastSuccess.mock.calls.length).toBe(1);
    expect(mockToastSuccess.mock.calls[0].length).toBe(1);
    expect(mockToastSuccess.mock.calls[0][0]).toBe(successReason);

    expect(mockToastError.mock.calls.length).toBe(2);
    expect(mockToastError.mock.calls[0].length).toBe(1);
    expect(mockToastError.mock.calls[0][0]).toBe(
      "C'è un problema temporaneo, riprova."
    );
    expect(mockToastError.mock.calls[1][0]).toBe(
      "C'è un problema temporaneo, riprova."
    );

    expect(mockedAnnounceForAccessibility.mock.calls.length).toBe(0);
  });
});

const mockSelectorOutput = (
  processingResultType: "success" | "error" | undefined = undefined,
  processingResultReason: string | undefined = undefined,
  isScreenReaderEnabled: boolean = false,
  inboxErrorReason: string | undefined = undefined,
  archiveErrorReason: string | undefined = undefined
) => {
  jest
    .spyOn(archivingReducer, "processingResultTypeSelector")
    .mockImplementation((_state: GlobalState) => processingResultType);
  jest
    .spyOn(archivingReducer, "processingResultReasonSelector")
    .mockImplementation((_state: GlobalState) => processingResultReason);
  jest
    .spyOn(preferencesReducer, "isScreenReaderEnabledSelector")
    .mockImplementation((_state: GlobalState) => isScreenReaderEnabled);
  jest
    .spyOn(allPaginatedReducer, "inboxMessagesErrorReasonSelector")
    .mockImplementation((_state: GlobalState) => inboxErrorReason);
  jest
    .spyOn(allPaginatedReducer, "archiveMessagesErrorReasonSelector")
    .mockImplementation((_state: GlobalState) => archiveErrorReason);
};

const renderComponent = () => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, initialState as any);

  return renderScreenWithNavigationStoreContext(
    () => <Toasts />,
    MESSAGES_ROUTES.MESSAGES_HOME,
    {},
    store
  );
};
