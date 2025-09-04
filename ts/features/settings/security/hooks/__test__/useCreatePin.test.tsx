import { render, fireEvent } from "@testing-library/react-native";
import { Text, Button } from "react-native";
import I18n from "i18next";
import { useCreatePin } from "../useCreatePin";
import * as keychain from "../../../../../utils/keychain";
import * as analytics from "../../../common/analytics";
import * as hooks from "../../../../../store/hooks";
import * as navigationHooks from "../../../../../navigation/params/AppParamsList";
import { SETTINGS_ROUTES } from "../../../common/navigation/routes";
import { createPinSuccess } from "../../store/actions/pinset";
import { PinString } from "../../../../../types/PinString";

jest.mock("../../../../../utils/keychain", () => ({
  setPin: jest.fn()
}));

jest.mock("../../../../../utils/supportAssistance", () => ({
  handleSendAssistanceLog: jest.fn(),
  assistanceToolRemoteConfig: jest.fn().mockReturnValue("mockTool")
}));

jest.mock("../../../../../store/hooks", () => ({
  useIODispatch: jest.fn(),
  useIOSelector: jest.fn(),
  useIOToast: jest.fn()
}));

jest.mock("../../../../../navigation/params/AppParamsList", () => ({
  useIONavigation: jest.fn()
}));

jest.mock("../../../../../utils/analytics", () => ({
  getFlowType: jest.fn().mockReturnValue("mockFlow")
}));

jest.mock("../../../common/analytics", () => ({
  trackCreatePinSuccess: jest.fn()
}));

const mockToastSuccess = jest.fn();

jest.mock("@pagopa/io-app-design-system", () => {
  const actual = jest.requireActual("@pagopa/io-app-design-system");
  return {
    ...actual,
    useIOToast: () => ({
      success: mockToastSuccess
    })
  };
});

const TestComponent = ({
  isOnboarding = false
}: {
  isOnboarding?: boolean;
}) => {
  const { handleSubmit } = useCreatePin({ isOnboarding });

  return (
    <>
      <Text testID="title">Test</Text>
      <Button
        title="submit"
        onPress={() => handleSubmit("1234" as PinString)}
      />
    </>
  );
};

describe("useCreatePin", () => {
  const mockDispatch = jest.fn();
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (hooks.useIODispatch as jest.Mock).mockReturnValue(mockDispatch);
    (hooks.useIOSelector as jest.Mock).mockReturnValue(true); // isFirstOnboarding
    (navigationHooks.useIONavigation as jest.Mock).mockReturnValue({
      navigate: mockNavigate
    });
    (keychain.setPin as jest.Mock).mockResolvedValue(undefined);
  });

  it("should match snapshot", () => {
    const { toJSON } = render(<TestComponent />);
    expect(toJSON()).toMatchSnapshot();
  });

  it("should handle success when not onboarding", async () => {
    const { getByText } = render(<TestComponent isOnboarding={false} />);

    fireEvent.press(getByText("submit"));

    await Promise.resolve(); // wait microtask queue
    expect(keychain.setPin).toHaveBeenCalledWith("1234");
    expect(mockDispatch).toHaveBeenCalledWith(
      createPinSuccess("1234" as PinString)
    );
    expect(mockToastSuccess).toHaveBeenCalledWith(
      I18n.t("onboarding.pin.success.message")
    );
    expect(mockNavigate).toHaveBeenCalledWith(
      SETTINGS_ROUTES.PROFILE_NAVIGATOR,
      {
        screen: SETTINGS_ROUTES.PROFILE_SECURITY
      }
    );
    expect(analytics.trackCreatePinSuccess).toHaveBeenCalledWith("mockFlow");
  });

  it("should not navigate or show toast if onboarding is true", async () => {
    const { getByText } = render(<TestComponent isOnboarding={true} />);
    fireEvent.press(getByText("submit"));
    await Promise.resolve();

    expect(mockToastSuccess).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
