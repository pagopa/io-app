import { fireEvent, render } from "@testing-library/react-native";
import I18n from "i18next";
import { Button, Text } from "react-native";

import * as navigationHooks from "../../../../../navigation/params/AppParamsList";
import * as hooks from "../../../../../store/hooks";
import { PinString } from "../../../../../types/PinString";
import * as keychain from "../../../../../utils/keychain";
import * as analytics from "../../../common/analytics";
import { SETTINGS_ROUTES } from "../../../common/navigation/routes";
import { createPinSuccess } from "../../store/actions/pinset";
import { useCreatePin } from "../useCreatePin";

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

jest.mock("@io-app/design-system", () => {
  const actual = jest.requireActual("@io-app/design-system");
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
        onPress={() => handleSubmit("1234" as PinString)}
        title="submit"
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
